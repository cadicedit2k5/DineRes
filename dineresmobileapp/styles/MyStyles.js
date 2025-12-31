import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        backgroundColor: "white",
        marginTop: 20
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between"
    },
    bg: {
      backgroundColor: "#F6F4EF"
    },
    margin: {
        margin: 5
    }, padding: {
        padding: 5
    }, avatar: {
        width: 120,
        height: 120,
        borderRadius: 100
    }, title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "blue",
        alignSelf: "center"
    }
});