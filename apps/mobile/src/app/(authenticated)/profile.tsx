import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { authClient } from "@/lib/auth";

export default function ProfileScreen() {
	const insets = useSafeAreaInsets();
	const { data: session, isPending } = authClient.useSession();
	const [isSigningOut, setIsSigningOut] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// The root guard already keeps unauthenticated users on sign-in; this is a
	// second line of defence for direct navigation to /profile.
	if (isPending) {
		return (
			<ThemedView style={styles.centered}>
				<ActivityIndicator />
			</ThemedView>
		);
	}

	if (!session) {
		return <Redirect href="/sign-in" />;
	}

	const { user } = session;

	async function handleSignOut() {
		setIsSigningOut(true);
		setError(null);
		try {
			await authClient.signOut();
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Unable to sign out");
			setIsSigningOut(false);
		}
	}

	return (
		<ThemedView style={[styles.container, { paddingTop: insets.top }]}>
			<ThemedView style={styles.content}>
				<ThemedText type="subtitle">Profile</ThemedText>

				<View>
					{user.image ? (
						<Image
							contentFit="cover"
							source={{ uri: user.image }}
							style={styles.avatar}
						/>
					) : (
						<ThemedView style={styles.avatar}>
							<ThemedText type="subtitle">
								{user.name?.charAt(0).toUpperCase() ?? "?"}
							</ThemedText>
						</ThemedView>
					)}
				</View>

				<ThemedText type="title" style={styles.name}>
					{user.name ?? "Unnamed"}
				</ThemedText>

				<ThemedView type="backgroundElement" style={styles.card}>
					<ThemedText themeColor="textSecondary" type="small">
						Email
					</ThemedText>
					<ThemedText type="default">{user.email}</ThemedText>

					<ThemedText themeColor="textSecondary" type="small">
						Timezone
					</ThemedText>
					<ThemedText type="default">{user.timezone}</ThemedText>
				</ThemedView>

				<Pressable
					accessibilityRole="button"
					disabled={isSigningOut}
					onPress={handleSignOut}
					style={({ pressed }) => [
						styles.button,
						pressed && styles.pressed,
						isSigningOut && styles.disabled,
					]}
				>
					{isSigningOut ? (
						<ActivityIndicator />
					) : (
						<ThemedText type="default">Sign out</ThemedText>
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
	centered: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
	},
	content: {
		flex: 1,
		gap: Spacing.two,
		maxWidth: MaxContentWidth,
		paddingHorizontal: Spacing.five,
		paddingTop: Spacing.five,
		width: "100%",
		alignSelf: "center",
	},
	avatar: {
		alignItems: "center",
		borderRadius: 999,
		height: 96,
		justifyContent: "center",
		width: 96,
	},
	name: {
		fontSize: 28,
		lineHeight: 34,
	},
	card: {
		borderRadius: Spacing.three,
		gap: Spacing.one,
		marginTop: Spacing.three,
		padding: Spacing.three,
	},
	button: {
		alignItems: "center",
		borderRadius: Spacing.three,
		justifyContent: "center",
		marginTop: Spacing.four,
		minHeight: 48,
		paddingHorizontal: Spacing.four,
	},
	pressed: {
		opacity: 0.7,
	},
	disabled: {
		opacity: 0.6,
	},
});
