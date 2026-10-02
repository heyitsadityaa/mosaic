import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { authClient } from "@/lib/auth";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
	const insets = useSafeAreaInsets();
	const { data: session, isPending } = authClient.useSession();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
		<ThemedView style={[styles.container, { paddingTop: insets.top }]}>
			<ThemedView style={styles.content}>
				<ThemedText type="title">Mosaic</ThemedText>
				<ThemedText themeColor="textSecondary" type="default">
					Sign in to continue.
				</ThemedText>

				<Pressable
					accessibilityRole="button"
					disabled={isLoading || isPending}
					onPress={handleSignIn}
					style={({ pressed }) => [
						styles.button,
						pressed && styles.pressed,
						(isLoading || isPending) && styles.disabled,
					]}
				>
					{isLoading || isPending ? (
						<ActivityIndicator color="#ffffff" />
					) : (
						<ThemedText style={styles.buttonLabel}>
							Continue with Google
						</ThemedText>
					)}
				</Pressable>

				{error && (
					<ThemedText themeColor="textSecondary" type="small">
						{error}
					</ThemedText>
				)}
			</ThemedView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		gap: Spacing.two,
		justifyContent: "center",
		maxWidth: MaxContentWidth,
		paddingHorizontal: Spacing.five,
		width: "100%",
		alignSelf: "center",
	},
	button: {
		alignItems: "center",
		backgroundColor: "#208AEF",
		borderRadius: Spacing.three,
		justifyContent: "center",
		marginTop: Spacing.three,
		minHeight: 48,
		paddingHorizontal: Spacing.four,
	},
	buttonLabel: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: 600,
	},
	pressed: {
		opacity: 0.7,
	},
	disabled: {
		opacity: 0.6,
	},
});
