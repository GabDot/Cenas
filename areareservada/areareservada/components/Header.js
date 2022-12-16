import { ImageBackground, StyleSheet, Text, View } from 'react-native';

export default function Header() {
    return (
        <ImageBackground source={require("../assets/header.png")} style={styles.header}>
        </ImageBackground>
    )
}
const styles = StyleSheet.create({
    header: {
        height: 110,


    },
});