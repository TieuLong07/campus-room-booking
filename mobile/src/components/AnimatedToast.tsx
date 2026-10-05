import React, { useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useUIStore, ToastType } from "../stores/uiStore";

const CONFIG: Record<
  ToastType,
  { bg: string; border: string; icon: keyof typeof Feather.glyphMap; iconColor: string; titleColor: string }
> = {
  success: {
    bg: "#ffffff",
    border: "#bbf7d0",
    icon: "check-circle",
    iconColor: "#16a34a",
    titleColor: "#15803d",
  },
  conflict: {
    bg: "#ffffff",
    border: "#fed7aa",
    icon: "alert-triangle",
    iconColor: "#ea580c",
    titleColor: "#c2410c",
  },
  error: {
    bg: "#ffffff",
    border: "#fecaca",
    icon: "x-circle",
    iconColor: "#dc2626",
    titleColor: "#b91c1c",
  },
  info: {
    bg: "#ffffff",
    border: "#e4e4e7",
    icon: "info",
    iconColor: "#09090b",
    titleColor: "#09090b",
  },
};

export const AnimatedToast: React.FC = () => {
  const { toast, hideToast } = useUIStore();
  const scale = useSharedValue(0.96);

  useEffect(() => {
    if (toast.visible) {
      scale.value = withSpring(1, { damping: 14, stiffness: 120 });
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, hideToast]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
    }),
    [scale]
  );

  if (!toast.visible) return null;

  const cfg = CONFIG[toast.type] || CONFIG.info;

  return (
    <Animated.View
      entering={FadeInUp.duration(300).springify().damping(15)}
      exiting={FadeOutUp.duration(250)}
      style={[
        styles.container,
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.iconWrapper}>
        <Feather name={cfg.icon} size={18} color={cfg.iconColor} />
      </View>

      <View style={styles.textWrapper}>
        <Text style={[styles.title, { color: cfg.titleColor }]}>{toast.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
      </View>

      <TouchableOpacity onPress={hideToast} style={styles.closeBtn} activeOpacity={0.7}>
        <Feather name="x" size={14} color="#a1a1aa" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "web" ? 16 : 54,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrapper: {
    marginRight: 10,
    marginTop: 1,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 12,
    color: "#52525b",
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 2,
  },
});
