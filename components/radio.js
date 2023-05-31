import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { global } from '../styles/globals';
import queryString from 'query-string';
import ErrorModal from './ErrorModal';
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

const RadioInput = (date,refreshing) => {
    const options = [
        { label: 'Carne', value: 'N' },
        { label: 'Peixe', value: 'O' },
        { label: 'Dieta', value: 'D' },
        { label: 'Vegetariano', value: 'V' },
      ];
      const [selectedOption, setSelectedOption] = useState();
      const [isModalVisible, setIsModalVisible] = useState(false);
      const [eatenOption,setEatenOption] = useState();
      const [message,setMessage] = useState('')
      const tk = 'Y-WywHe6uXAVa9z9yfUZVfEuODDRzbftZ-0JylWY0kqb46MXL9FYloflIO5vnj4vPS1V3hJ4aP0YasupkgI0FdpvYBt9PCcGDdd5lbGazugYZWvy0YiPPdCeuYkJS5Wr5JRZEC3jye8r3LXQSM3QM673d-uXXbeL_VmWrd8NGa3LlcRonsgqT6aNLoRcqpSZBNQBkRTc1e2g-NU82g4b-7bNDU1sJyp0KuiBVHggwO9dH5kOwAa3rN1oivBW0jtedDeYNEQe8QAMYWxGXviIg3X9TIbzPX7dSt759rJtK92ecqd8e60bRyTOcOUMhD8z';


      async function submitSenha() {
        const parser = new XMLParser();
        console.log(date);
        console.log(selectedOption);
      
        const details = {
          tk: tk,
          dt: date.date,
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
          }).then(setIsModalVisible(true));
      
        } catch (error) {
          console.log('Error:', error);
        }
      }
      useEffect(() =>  {
        async function verificarSenha() {
          const parser = new XMLParser();
          
        
          const details = {
            tk: tk,
            dt: date.date,
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
            setEatenOption(data.opcaomenu.menu)
           
            
          } catch (error) {
            console.log('Error:', error);
          }
        }
        verificarSenha();

      },[refreshing])
      
      
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
    <View style={styles.contaiener}>
      <ErrorModal visible={isModalVisible} onClose={() => setIsModalVisible(false)}  message={'Senha marcada!'}></ErrorModal>
        <View style={styles.containerRow}>
        {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[styles.option, selectedOption === option.value && styles.selected]}
          onPress={() => handleOptionSelect(option.value)}
        >
          <View style={[styles.radio, selectedOption === option.value && styles.selectedRadio]} />
          <Text style={styles.optionText}>{option.label}</Text>
        </TouchableOpacity>
      ))}
        </View>
        <TouchableOpacity onPress={() => [submitSenha()]} style={styles.submitButton}><Text style={[global.p,{color:'white',fontSize:20}]}>Marcar</Text></TouchableOpacity>
    </View>
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
