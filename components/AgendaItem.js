import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { global } from "../styles/globals";
import moment from 'moment';
import 'moment/locale/pt-br'
import { useEffect, useLayoutEffect, useState } from "react";


export default function AgendaItem({ agenda, navigation }) {
    const [formattedDate, setFormattedDate] = useState('');
    moment.locale('pt-br');
    useEffect(() => {
      const date = moment(agenda.DtaIni, 'YYYY-MM-DD');
      
      const formattedDate = date.format('dddd, D [de] MMMM [de] YYYY');
      setFormattedDate(formattedDate);
    }, [agenda.DtaIni]);
  
    let color;
    if (agenda.Tipo === 'TST') {
      color = '#778ca3';
    } else if (agenda.Tipo === 'F') {
      color = '#C7254E';
    } else if (agenda.Tipo === 'G') {
      color = '#38ada9';
    } else if (agenda.Tipo === 'VIS') {
      color = '#9b59b6';
    } else {
      color = '#beac9a';
    }
  
    return (
      <>
        <Pressable
          style={styles.container}
          onPress={() =>
            navigation.navigate('Agenda', {
              runFunction: true,
              selectedClickDate: agenda.DtaIni,
            })
          }
        >
          <View style={[styles.color, { backgroundColor: color }]}></View>
          <View style={styles.content}>
            <Text style={[global.h3,{marginTop:-5}]}>{agenda.Titulo}</Text>
            <Text style={global.p}>{formattedDate}</Text>
          </View>
        </Pressable>
      </>
    );
  }
const styles = StyleSheet.create({
    content: {
        height: 'auto',
        backgroundColor: 'white',
        borderRadius: 10,
        marginRight: 17,
        marginTop: 25,
        zIndex: 2,
        padding:16
        

    },
    container: {
        width: 309,
       
    },
    image: {
        position: 'absolute',
        height: 70,
        width: 290,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        zIndex: 1
    },
    color: {
        position: 'absolute',
        zIndex: -1,
        elevation: -1,
        bottom: 20,
        width: 290,
        height: 65,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    }
})