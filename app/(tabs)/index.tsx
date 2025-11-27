import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { Button, Text, View, StyleSheet, Alert } from 'react-native';

export default function HomeScreen() {
  // Definindo o tipo do estado para evitar erro de TypeScript
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [statusMsg, setStatusMsg] = useState('Aguardando...');

  // 1. Pedir permissão ao iniciar o app
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setStatusMsg('Permissão de acesso à localização negada');
        return;
      }
      setStatusMsg('Permissão concedida! Pressione o botão.');
    })();
  }, []);

  // 2. Função para pegar e enviar a localização
  const enviarGPS = async () => {
    try {
      setStatusMsg('Obtendo localização...');
      
      // Pega a posição atual
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setStatusMsg('Enviando dados...');

      // IMPORTANTE: Troque SEU_IP_LOCAL abaixo pelo seu IPv4 (veja no 'ipconfig')
      // Exemplo: http://192.168.1.5:3000/gps
      const backendUrl = 'http://SEU_IP_LOCAL:3000/gps'; 

      await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          timestamp: loc.timestamp,
        }),
      });

      setStatusMsg('Localização enviada com sucesso!');
      Alert.alert("Sucesso", "Dados enviados para o backend!");
      
    } catch (error: any) {
      console.log(error);
      setStatusMsg('Erro ao enviar: ' + error.message);
      Alert.alert("Erro", "Falha ao conectar no servidor. Verifique o IP.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rastreador GPS</Text>
      
      <View style={styles.infoBox}>
        <Text style={{textAlign: 'center', marginBottom: 10}}>Status: {statusMsg}</Text>
        
        {location && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>Lat: {location.coords.latitude}</Text>
            <Text style={styles.dataText}>Long: {location.coords.longitude}</Text>
          </View>
        )}
      </View>

      <Button title="Enviar Minha Localização" onPress={enviarGPS} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  infoBox: {
    marginBottom: 30,
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    elevation: 3, // Sombra no Android
  },
  dataContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  dataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  }
});