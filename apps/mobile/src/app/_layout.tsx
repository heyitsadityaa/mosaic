import { authClient } from "@/lib/auth";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { data: session, isPending } = authClient.useSession();

	// Until the session resolves, register both trees. A Google sign-in returns
	// to the `/profile` deep link while the session is still being fetched, and
	// an unregistered group would make that URL unresolvable. The splash covers
	// this window; `profile` shows a spinner and then decides for itself.
	const resolved = !isPending;

	useEffect(() => {
		if (resolved) {
			SplashScreen.hide();
		}
	}, [resolved]);

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
