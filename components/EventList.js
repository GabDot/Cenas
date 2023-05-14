import React from 'react';
import { Text, View, StyleSheet,TouchableOpacity } from 'react-native';
import { global } from '../styles/globals';


const EventList = ({ events, noEventsMessage, selectedDate }) => {
  const filteredEvents = events.filter(event => event.DtaIni === selectedDate);

if (filteredEvents.length > 0) {
  return (
    <View style={styles.infoContainer}>
      <Text style={[{fontWeight:'bold'},global.p]}>
        {filteredEvents.map((event, index, array) => {
          const separator = index === array.length - 1 ? '' : '\n\n';
          return `${event.Titulo}${separator}`; // Use capitalized property name
        })}
      </Text>
    </View>
  );
} else {
  return (
    <View style={styles.infoContainer}>
      <Text style={[global.p]}>{noEventsMessage}</Text>
    </View>
  );
}
}

const styles = StyleSheet.create({
  infoContainer: {
    height: 'auto',
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
});

export default EventList;