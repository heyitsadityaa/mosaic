import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	ScrollView,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authClient } from "@/lib/auth";

WebBrowser.maybeCompleteAuthSession();

const googleG = require("@/assets/images/google-g.svg");

// Mini mark geometry from DESIGN.md §2.2: an 18px 3×3 mosaic with a 4.8px
// step, five filled diagonal tiles, and four outlined off-diagonal tiles.
const MARK_TILE = 4.8;
const MARK_STEP = 6.6;
const MARK_OUTLINE_TILE = 4.2;
const MARK_OUTLINE_INSET = 0.3;

function MiniMark() {
	return (
		<View aria-hidden className="h-[18px] w-[18px]">
			{[0, 1, 2].map((row) =>
				[0, 1, 2].map((column) => {
					const filled = row === column || row + column === 2;

					return (
						<View
							key={`${row}-${column}`}
							className={
								filled ? "absolute bg-foreground" : "absolute border-foreground"
							}
							style={{
								left: column * MARK_STEP + (filled ? 0 : MARK_OUTLINE_INSET),
								top: row * MARK_STEP + (filled ? 0 : MARK_OUTLINE_INSET),
								width: filled ? MARK_TILE : MARK_OUTLINE_TILE,
								height: filled ? MARK_TILE : MARK_OUTLINE_TILE,
								borderWidth: filled ? 0 : 0.75,
							}}
						/>
					);
				}),
			)}
		</View>
	);
}

export default function SignInScreen() {
	const insets = useSafeAreaInsets();
	const scheme = useColorScheme();
	const isDark = scheme === "dark";
	const { data: session, isPending } = authClient.useSession();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const busy = isLoading || isPending;

	// NativeWind reads the dark theme variables from a `dark` class on the web
	// root. Keep the toggle here so the rest of the app is not affected.
	useEffect(() => {
		if (Platform.OS !== "web") {
			return;
		}

		const root = document.documentElement;
		root.classList.toggle("dark", isDark);

		return () => root.classList.remove("dark");
	}, [isDark]);

	// The root guard unregisters this screen once a session exists, but which
	// route the navigator falls back to is not guaranteed, so land on the
	// profile explicitly. This also covers the in-place session refresh that
	// follows a successful Google sign-in.
	useEffect(() => {
		if (session) {
			router.replace("/profile");
		}
	}, [session]);

	async function handleSignIn() {
		setIsLoading(true);
		setError(null);
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/profile",
			});
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Unable to start Google sign-in",
			);
		}
		setIsLoading(false);
	}

	return (
		<View className="flex-1 bg-background">
			<StatusBar style={isDark ? "light" : "dark"} />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1 }}
				showsVerticalScrollIndicator={false}
			>
				<View
					className="w-full max-w-[390px] flex-1 self-center px-6"
					style={{
						paddingTop: Platform.OS === "web" ? 70 : insets.top + 8,
						paddingBottom: Platform.OS === "web" ? 0 : insets.bottom,
					}}
				>
					<View className="flex-row items-center mt-6 gap-2">
						<MiniMark />
						<Text className="text-[13px] font-bold leading-4 tracking-[2.08px]">
							MOSAIC
						</Text>
					</View>

					<View className="flex-1 justify-end">
						<Text
							aria-level={1}
							className="max-w-[300px] text-[30px] font-bold leading-9 tracking-[-0.6px]"
							role="heading"
						>
							Sign in or create your account
						</Text>
						<Text className="mt-3 max-w-[280px] text-[15px] leading-[22px] text-muted-foreground">
							Track focus, build streaks, see your year in cells.
						</Text>
					</View>

					<View className="pt-10">
						<Button
							accessibilityLabel={busy ? "Signing in" : "Continue with Google"}
							aria-busy={busy}
							className="h-14 w-full gap-3 rounded-none px-4 opacity-100 sm:h-14"
							disabled={busy}
							onPress={handleSignIn}
						>
							{busy ? (
								<ActivityIndicator
									color={isDark ? "#000000" : "#ffffff"}
									size="small"
									style={{ transform: [{ scale: 0.8 }] }}
								/>
							) : (
								<>
									<Image
										alt=""
										contentFit="contain"
										source={googleG}
										style={{ height: 18, width: 18 }}
									/>
									<Text numberOfLines={1}>Continue with Google</Text>
								</>
							)}
						</Button>

						{error ? (
							<View
								className="mt-4 h-[52px] flex-row items-center justify-between gap-3 border border-foreground p-3"
								role="alert"
							>
								<View className="flex-1 flex-row items-center gap-2">
									<Text className="shrink-0 text-[11px] font-bold tracking-[1.32px]">
										{"COULDN'T SIGN IN"}
									</Text>
									<Text
										className="flex-1 text-[12px] text-muted-foreground"
										numberOfLines={1}
									>
										{error}
									</Text>
								</View>

								<Pressable
									accessibilityLabel="Retry sign-in"
									className="py-1 active:opacity-60"
									disabled={busy}
									hitSlop={8}
									onPress={handleSignIn}
									role="button"
								>
									<Text className="text-[10px] font-bold tracking-[1.2px] underline">
										RETRY
									</Text>
								</Pressable>
							</View>
						) : null}

						<View className="mt-4 items-center">
							<Text className="max-w-[272px] text-center text-[12px] leading-[18px] text-muted-foreground">
								By continuing, you agree to the Terms of Service and Privacy
								Policy.
							</Text>
						</View>

						{Platform.OS === "web" ? (
							<View className="items-center pb-2 pt-6">
								<View className="h-[5px] w-[140px] rounded-full bg-foreground" />
							</View>
						) : null}
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
