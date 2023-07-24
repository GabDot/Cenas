import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { global } from '../styles/globals';
import queryString from 'query-string';
import ErrorModal from './ErrorModal';
import NetInfo from '@react-native-community/netinfo';
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
import { useToast } from "react-native-toast-notifications";
import moment from 'moment/moment';
const RadioInput = ({date,refreshing,disabled}) => {
    const options = [
        { label: 'Carne', value: 'N' },
        { label: 'Peixe', value: 'O' },
        { label: 'Dieta', value: 'D' },
        { label: 'Vegetariano', value: 'V' },
      ];
      const [selectedOption, setSelectedOption] = useState();
      const [isModalVisible, setIsModalVisible] = useState(false);
      const [eatenOption,setEatenOption] = useState();
      const [message,setMessage] = useState('');
      const [reload,setReload] = useState(false);
      const [marcado,setMarcado] = useState(false);
      const [eatenString,setEatenString] = useState('')
      const [isConnected, setIsConnected] = useState();
      const [eaten,setEaten] = useState('')
      const toast = useToast();
      const today = new Date();
      const formattedToday = moment(today).format('DD/MM/YYYY');
      const [eatenTime,setEatenTime] = useState('')
      console.log("today formatado",formattedToday)
      console.log("datas",date)
      const tk = 'Y-WywHe6uXAVa9z9yfUZVfEuODDRzbftZ-0JylWY0kqb46MXL9FYloflIO5vnj4vPS1V3hJ4aP0YasupkgI0FdpvYBt9PCcGDdd5lbGazugYZWvy0YiPPdCeuYkJS5Wr5JRZEC3jye8r3LXQSM3QM673d-uXXbeL_VmWrd8NGa3LlcRonsgqT6aNLoRcqpSZBNQBkRTc1e2g-NU82g4b-7bNDU1sJyp0KuiBVHggwO9dH5kOwAa3rN1oivBW0jtedDeYNEQe8QAMYWxGXviIg3X9TIbzPX7dSt759rJtK92ecqd8e60bRyTOcOUMhD8z';


      async function submitSenha() {
        const parser = new XMLParser();
        
      
        const details = {
          tk: tk,
          dt: date,
          user: '15496',
          op: selectedOption,
        };
      
        
         const formBody = queryString.stringify(details);
         
      
        try {
          const response = await fetch('https://www.cic.pt/alunos/srvmarcarefeicao.asp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;',
            },
            body: formBody,
          }).then(() => {
            
            !marcado ? toast.show('Senha marcada', {
              type: "success",
              placement: "top",
              duration: 4000,
              offset: 30,
              animationType: "slide-in",
            }) : toast.show('Senha alterada', {
              type: "success",
              placement: "top",
              duration: 4000,
              offset: 30,
              animationType: "slide-in",
            });
            
            setMarcado(true);
            setReload(!reload);
          });
      
        } catch (error) {
          console.log('Error:', error);
        }
      }
      async function eliminarSenha() {
        const parser = new XMLParser();
        
      
        const details = {
          tk: tk,
          dt: date,
          user: '15496',
          op: 'E',
        };
      
        
         const formBody = queryString.stringify(details);
         
      
        try {
          const response = await fetch('https://www.cic.pt/alunos/srvmarcarefeicao.asp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;',
            },
            body: formBody,
          }).then(setMarcado(false),setReload(!reload),toast.show('Senha desmarcada', {
            type: "warning",
            placement: "top",
            duration: 4000,
            offset: 30,
            animationType: "slide-in",
          }));
      
        } catch (error) {
          console.log('Error:', error);
        }
      }
      useEffect(() =>  {
        const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
          console.log(isConnected);
          setIsConnected(state.isConnected);
    
        });
        async function verificarSenha() {
          const parser = new XMLParser();
          
        
          const details = {
            tk: tk,
            dt: date,
            user: '15496',
          };
        
          
           const formBody = queryString.stringify(details);
        
          try {
            const response = await fetch('https://www.cic.pt/alunos/srvconsultarefeicao.asp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded;',
              },
              body: formBody,
            });
            const blob = await response.blob();
            const text = await convertBlobToText(blob, 'ISO-8859-1');
          
            const data = parser.parse(text);
            
            setSelectedOption(data.opcaomenu.menuE)
            if(data.opcaomenu.menuE){
              setMarcado(true);
            }
            console.log(data.opcaomenu.menu,date)
            switch (data.opcaomenu.menu) {
              case 'N':
                setEatenString('(Prato de carne)');
                break;
              case 'O':
                setEatenString('(Prato de peixe)');
                break;
              case 'D':
                setEatenString('(Prato de dieta)');
                break;
              case 'V':
                setEatenString('(Prato vegetariano)');
                break;
            }
            setEatenTime(data.opcaomenu.hora)
            if(data.opcaomenu.almocou == 'True'){
              setEaten('Almoçou às')
            }
            else{
              setEaten('Não almoçou')
            }
            setEatenOption(data.opcaomenu.menu)
           
            
          } catch (error) {
            console.log('Error:', error);
          }
        }
        if(isConnected){
          verificarSenha();
        }
        
        return () => {
          unsubscribeNetInfo();
        };
      },[isConnected,refreshing,reload])
      
      
      async function convertBlobToText(blob, encoding) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsText(blob, encoding);
        });
      
            }
   

  
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  return (
    isConnected?(
    !disabled?(
      <View style={styles.contaiener}>
      <ErrorModal visible={isModalVisible} onClose={() => setIsModalVisible(false)}  message={message}></ErrorModal>
        <View style={styles.containerRow}>
        {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[styles.option, selectedOption === option.value && styles.selected]}
          onPress={() => handleOptionSelect(option.value)}
        >
          
          <View style={[styles.radio, selectedOption === option.value && styles.selectedRadio]} />
          <Text style={global.p}>{option.label}</Text>
        </TouchableOpacity>
      ))}
        </View>
        <TouchableOpacity onPress={() => [submitSenha()]} style={styles.submitButton}>
  <Text style={[global.p,{color:'white',fontSize:20}]}>
    {marcado ? 'Remarcar' : 'Marcar'}
  </Text>
</TouchableOpacity>
        {marcado&&(<TouchableOpacity onPress={() => [eliminarSenha()]} style={{justifyContent:'center',alignItems:'center',marginVertical:10,backgroundColor:'white',padding:10,borderRadius:10,borderWidth:1,borderColor:'#9abebb'}}><Text style={[global.p,{color:'#9abebb',fontSize:20}]}>Desmarcar senha</Text></TouchableOpacity>)}
        
    </View>

    ):(
      <View style={styles.contaiener}>
     <View style={styles.containerRow}>
        {options.map((option) => (
        <View
          key={option.value}
          style={[styles.option, selectedOption === option.value && styles.selected]}
          
        >
          
          <View style={[styles.radio,formattedToday==date&&{borderColor:'white'} ,selectedOption === option.value && styles.selectedRadio]} />
<Text style={[global.p,formattedToday==date&&{color:'white'}]}>{option.label}</Text>
        </View>
      ))}
        </View>
        <View style={{justifyContent:'center',alignItems:'center',marginVertical:10,backgroundColor:'white',padding:10,borderRadius:10,borderWidth:1,borderColor:'#9abebb'}}><Text style={[global.p,{color:'#9abebb',fontSize:16}]}>{eaten} {eatenTime} {eatenString}</Text></View>
    </View>
    )
    ):(
      <View style={styles.contaiener}>
       
    </View>
    )
  );
};
const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
    containerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
        justifyContent: 'flex-start',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    radio: {
      width: windowWidth * 0.04,
      height: windowWidth * 0.04,
      borderRadius: windowWidth * 0.02,
      borderWidth: 2,
      borderColor: 'gray',
      marginRight: windowWidth * 0.03,
    },
    selectedRadio: {
      backgroundColor: 'gray',
    },
    optionText: {
      fontSize: windowWidth * 0.04,
      color: 'black',
    }, submitButton: {
        marginTop:20,
        backgroundColor: '#9abebb',
        padding: 5,
        width: '100%',
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    
      },
      submitButtonText: {
        color: '#fff',
        fontSize: 16,
      },
  });

export default RadioInput;
