import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { Platform } from 'react-native';

export default function TabOneScreen() {
  const [errorMsg, setErrorMsg] = useState(null); 
  const [coords, setCoords] = useState(null);

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  console.log(data);


  useEffect(() => {
    (async function loadPosition() {
// A função requestMultiple serve para requisitar múltiplas autorizações do usuário em sequência. As requisições são feitas na ordem passada. 

      const result = requestMultiple(
        [
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION
        ]).then(
          (statuses) => {
//statuses é um vetor que contém as respostas escolhidas pelo usuário em cada uma das autorizações solicitadas.
            const statusFine = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];  //pegamos a autorização que o usuário selecionou para uso do GPS e para obter localização em primeiro plano
            const statusBack = statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION]; 
//pegamos a autorização que o usuário selecionou para localização em background 
            if (Platform.Version < 29) { 
//Em APIs do Android abaixo da 29 não é necessário permissão para background location, apenas solicitar acesso ao GPS já oferece tudo que é necessário para utilizar a localização em primeiro e segundo plano. Nesse caso, apenas verificamos se a autorização do GPS é positiva
              if (statusFine == 'granted') {
                return true;
              } else {
                setErrorMsg('Usuário não aceitou solicitação de uso do GPS');
              }
            }
// Caso a API seja > 29, é necessário verificar se ambas as autorizações foram positivas. 
            if (statusFine == 'granted' && statusBack == 'granted') {
              return true;
            } else {
              setErrorMsg('Usuário não aceitou solicitação de uso do GPS');
            }
          },
        );

// caso as permissões tenham sido obtidas com sucesso, result será true e a localização do usuário poderá ser obtida.
      if (result) {
        await Geolocation.getCurrentPosition(       //se as permissões foram aceitas, obtemos a localização aqui
          ({ coords }) => {
  // O parâmetro {coords} desestrutura a resposta, obtendo apenas a parte relativa às coordenadas. Você também pode receber apenas (position) e observar outras informações que são obtidas ao se solicitar a localização. Nesse exemplo, apenas precisamos das coordenadas.
            setCoords({
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
          }, (error) => {
            setErrorMsg('Não foi possível obter a localização');
          }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, showLocationDialog: true } 
          //showLocationDialog: essa função convida automaticamente o usuário a ativar o GPS, caso esteja desativado.
          //enableHighAccuracy: vai solicitar a ativação do GPS e coletar os dados dele
          //timeout: determina o tempo máximo para o dispositivo coletar uma posição
          //maximumAge: tempo máximo para coleta de posição armazenada em cache
        )
      }

    })()

    fetch('https://raw.githubusercontent.com/adhithiravi/React-Hooks-Examples/master/testAPI.json')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="/screens/TabOneScreen.tsx" />

      {isLoading ? <Text>Loading...</Text> : 
      ( <View style={{ flex: 1, flexDirection: 'column', justifyContent:  'space-between'}}>
          <Text style={{ fontSize: 18, color: 'green', textAlign: 'center'}}>{data.title}</Text>
          <Text style={{ fontSize: 14, color: 'green', textAlign: 'center', paddingBottom: 10}}>Articles:</Text>
          <FlatList
            data={data.articles}
            keyExtractor={({ id }, index) => id}
            renderItem={({ item }) => (
              <Text>{item.id + '. ' + item.title}</Text>
            )}
          />
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
