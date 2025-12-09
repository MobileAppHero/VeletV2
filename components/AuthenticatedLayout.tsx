import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";

    // Small delay to ensure navigation is ready
    const navigationTimer = setTimeout(() => {
      if (!user && !inAuthGroup) {
        // Redirect to auth screen if not authenticated
        console.log('No user session, redirecting to auth');
        router.replace("/auth");
      } else if (user && inAuthGroup) {
        // Redirect to main app if authenticated
        console.log('User authenticated, redirecting to home');
        router.replace("/");
      }
    }, 100);

    return () => clearTimeout(navigationTimer);
  }, [user, segments, loading, router]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFE1C6' }}>
        <ActivityIndicator size="large" color="#E45B5B" />
      </View>
    );
  }

  return <>{children}</>;
}