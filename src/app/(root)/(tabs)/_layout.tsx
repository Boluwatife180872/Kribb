import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform, StyleSheet } from "react-native";
import { useUserStore } from "../../../../store/userStore";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function AndroidTabs() {
  const isAdmin = useUserStore((state) => state.isAdmin);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  // return (
  //   <NativeTabs labelVisibilityMode="labeled">
  //     <NativeTabs.Trigger name="index" disableAutomaticContentInsets={true}>
  //       <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
  //       <NativeTabs.Trigger.Icon
  //         src={
  //           <NativeTabs.Trigger.VectorIcon
  //             family={MaterialCommunityIcons}
  //             name="home"
  //           />
  //         }
  //       />
  //     </NativeTabs.Trigger>
  // 
  //     <NativeTabs.Trigger name="search" disableAutomaticContentInsets={true}>
  //       <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
  //       <NativeTabs.Trigger.Icon
  //         src={
  //           <NativeTabs.Trigger.VectorIcon
  //             family={MaterialCommunityIcons}
  //             name="magnify"
  //           />
  //         }
  //       />
  //     </NativeTabs.Trigger>
  // 
  //     {isAdmin && (
  //       <NativeTabs.Trigger name="create" disableAutomaticContentInsets={true}>
  //         <NativeTabs.Trigger.Label>Add Property</NativeTabs.Trigger.Label>
  //         <NativeTabs.Trigger.Icon
  //           src={
  //             <NativeTabs.Trigger.VectorIcon
  //               family={MaterialCommunityIcons}
  //               name="plus-circle"
  //             />
  //           }
  //         />
  //       </NativeTabs.Trigger>
  //     )}
  // 
  //     <NativeTabs.Trigger name="saved" disableAutomaticContentInsets={true}>
  //       <NativeTabs.Trigger.Icon
  //         src={
  //           <NativeTabs.Trigger.VectorIcon
  //             family={MaterialCommunityIcons}
  //             name="heart"
  //           />
  //         }
  //       />
  //       <NativeTabs.Trigger.Label>Saved</NativeTabs.Trigger.Label>
  //     </NativeTabs.Trigger>
  // 
  //     <NativeTabs.Trigger name="profile" disableAutomaticContentInsets={true}>
  //       <NativeTabs.Trigger.Icon
  //         src={
  //           <NativeTabs.Trigger.VectorIcon
  //             family={MaterialCommunityIcons}
  //             name="account"
  //           />
  //         }
  //       />
  //       <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
  //     </NativeTabs.Trigger>
  //   </NativeTabs>
  // );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Add Property",
          href: isAdmin ? "/create" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}

function IOSTabs() {
  const isAdmin = useUserStore((state) => state.isAdmin);

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {isAdmin && (
        <NativeTabs.Trigger name="create">
          <NativeTabs.Trigger.Icon sf="plus.circle.fill" />
          <NativeTabs.Trigger.Label>Add Property</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}

      <NativeTabs.Trigger name="saved">
        <NativeTabs.Trigger.Icon sf="heart.fill" />
        <NativeTabs.Trigger.Label>Saved</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf="person.fill" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabsLayout() {
  return Platform.OS === "ios" ? <IOSTabs /> : <AndroidTabs />;
}

const styles = StyleSheet.create({
  tabBar: {
    height: 74,
    paddingBottom: 18,
    paddingTop: 8,
  },
});
