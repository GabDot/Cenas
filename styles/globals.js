
import { StyleSheet } from "react-native";

export const global = StyleSheet.create({
    h1: {
        fontFamily: 'sans-bold',
        fontSize: 36,
        color: '#1E1E1E',
        paddingBottom: 10,
    },
    h2: {
        fontFamily: 'sans-semibold',
        letterSpacing:1,
        color: '#1E1E1E',
        textTransform:'uppercase',
        fontSize: 22
    },
    h3: {
        fontFamily: 'sans-bold',
        fontSize: 17,
        color: '#1E1E1E',
    },
    p: {
        fontFamily: 'sans-medium',
        fontSize: 16,
        color: 'rgba(30, 30, 30, 0.63)'
    },
    p2: {
        fontFamily: 'sans-medium',
        fontSize: 12,
        color: 'rgba(30, 30, 30, 0.63)'
    }
})