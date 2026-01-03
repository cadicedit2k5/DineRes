import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        backgroundColor: "white",
        marginTop: 10
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
     avatar: {
        width: 120,
        height: 120,
        borderRadius: 100
    },title: { 
        fontSize: 24,
        textAlign: 'center',
        margin: 10,
        fontWeight: 'bold', 
        color: 'black' 
    },
    subTitle: { 
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        fontWeight: 'bold', 
        color: 'black' 
    },
    price: {
        fontWeight: 'bold',
        color: '#ee6a0dff',
    }
});