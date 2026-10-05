import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";

export const UserAuthHeader: React.FC = () => {
  const { user, session, isLoading, initialize, signInWithGoogle, signOut } = useAuthStore();
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      showToast("Đang xác thực", "Chuyển tiếp đến cổng Google OAuth...", "info");
    } catch (err: any) {
      showToast("Đăng nhập thất bại", err.message || "Không thể hoàn tất đăng nhập Google", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast("Đã đăng xuất", "Đã rời khỏi phiên đăng nhập.", "info");
    } catch (err: any) {
      showToast("Lỗi", err.message, "error");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.authContainer}>
        <ActivityIndicator size="small" color="#09090b" />
      </View>
    );
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Sinh viên VKU";

  return (
    <View style={styles.authContainer}>
      {session && user ? (
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email || "Đã đăng nhập Google"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={13} color="#71717a" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginRow}>
          <View style={styles.guestInfo}>
            <Text style={styles.guestTitle}>Cổng dịch vụ phòng học</Text>
            <Text style={styles.guestSub}>Đăng nhập để đồng bộ lịch đặt cá nhân</Text>
          </View>
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            activeOpacity={0.85}
          >
            <Feather name="log-in" size={13} color="#ffffff" />
            <Text style={styles.googleBtnText}>Google OAuth</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  authContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#09090b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#09090b",
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 11,
    color: "#71717a",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#ffffff",
  },
  logoutText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717a",
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guestInfo: {
    flex: 1,
    paddingRight: 10,
  },
  guestTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#09090b",
    letterSpacing: -0.2,
  },
  guestSub: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 1,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: "#09090b",
  },
  googleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: -0.1,
  },
});
