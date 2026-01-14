import { SafeAreaView } from 'react-native-safe-area-context'
import GoBack from '../../components/Layout/GoBack';
import Tables from '../../components/Tables'

const BookingDashboard = () => {
    return(
        <SafeAreaView style={{flex: 1}}>
            <GoBack />
            <Tables />
        </SafeAreaView>
    );
};

export default BookingDashboard;