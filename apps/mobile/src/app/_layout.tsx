import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { authClient } from "@/lib/auth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { data: session, isPending } = authClient.useSession();

	// Until the session resolves, register both trees. A Google sign-in returns
	// to the `/profile` deep link while the session is still being fetched, and
	// an unregistered group would make that URL unresolvable. The splash covers
	// this window; `profile` shows a spinner and then decides for itself.
	const resolved = !isPending;

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			{/* Always mounted: this overlay is what hides the native splash, so
			    gating it on `isPending` would strand `preventAutoHideAsync`.
			    It stays up until the session is known, otherwise an
			    already-authenticated user briefly sees the sign-in screen. */}
			<AnimatedSplashOverlay ready={resolved} />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Protected guard={!resolved || !session}>
					<Stack.Screen name="sign-in" />
				</Stack.Protected>
				<Stack.Protected guard={!resolved || Boolean(session)}>
					<Stack.Screen name="(authenticated)" />
				</Stack.Protected>
			</Stack>
		</ThemeProvider>
	);
}
