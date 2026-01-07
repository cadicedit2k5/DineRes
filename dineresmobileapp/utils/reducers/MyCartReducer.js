export default (current, action) => {
    switch (action.type) {
        case "add":
            const existingDish = current.find(item => item.id === action.payload.id);

            if (existingDish) {
                return current.map(item => {
                    if (item.id === action.payload.id) {
                        return {...item, quantity: item.quantity + action.payload.quantity}
                    }
                    return item;
                })
            }else {
                return [...current, action.payload]
            }
        case "update":
            return current.map(item => {
                if (item.id === action.payload.id) {
                    return {...item, quantity: action.payload.quantity};
                }
                return item;
            })
        case "remove":
            return current.filter(item => item.id !== action.payload.id);
        case "clear":
            return []
    }
    return current;
}