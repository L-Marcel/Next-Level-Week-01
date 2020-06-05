import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { Alert, View, ScrollView, TouchableOpacity, Image, Text, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import api from '../../services/api';
import styles from './styles';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface Points {
    id: number;
    name: string;
    image: string;
    image_url: string;
    latitude: number;
    longitude: number;
}

interface Params {
    uf: string;
    city: string;
}

const Points = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Points[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const routes = useRoute();
    const navigation = useNavigation();

    const routesParams = routes.params as Params;

    useEffect(() => {
        api.get('/items').then(function(res){
            setItems(res.data);
        });
    }, []);

    useEffect(() => {
        var _items = [1,2,3,4,5,6];
        if(selectedItems.length != 0){
            _items = selectedItems;
        }

        api.get('/points', {
            params: {
                city: routesParams.city,
                uf: routesParams.uf,
                items: _items
            }
        }).then(function(res){
            setPoints(res.data);
        });
    }, [selectedItems]);

    useEffect(() => {
        async function loadPosition(){
            const { status } = await Location.requestPermissionsAsync();
        
            if(status !== 'granted'){
                Alert.alert('Ops...', 'Precisamos de sua permissão para obter a localização.');
                return;
            }

            const location = await Location.getCurrentPositionAsync();

            const { latitude, longitude } = location.coords;
            console.log(latitude, longitude);

            setInitialPosition([
                latitude,
                longitude
            ]);
        }

        loadPosition();
    }, []);
    
    function handleNavigateBack(){
        navigation.goBack();
    }

    function handleNavigateToDetail(id: number){

        navigation.navigate('Detail', { point_id: id });
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems, id]);
        }
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {handleNavigateBack()}}>
                    <Icon name="arrow-left" size={20} color="#34cb79"></Icon>
                </TouchableOpacity>
                <Text style={styles.title}>
                    Bem vindo.
                </Text>
                <Text style={styles.description}>
                    Encontre no mapa um ponto de coleta.
                </Text>

                <View style={styles.mapContainer}>
                    {initialPosition[0] !== 0 && (<MapView style={styles.map} 
                    initialRegion={{
                        latitude: initialPosition[0],
                        longitude: initialPosition[1],
                        longitudeDelta: 0.014,
                        latitudeDelta: 0.014,
                    }}>
                        {points.map(function(point){
                            return(
                            <Marker
                                key={String(point.id)}
                                onPress={() => {handleNavigateToDetail(point.id)}}
                                style={styles.mapMarker}
                                coordinate={{
                                    latitude: point.latitude,
                                    longitude: point.longitude,
                                }}
                            >
                                <View style={styles.mapMarkerContainer}>
                                    <Image style={styles.mapMarkerImage} source={{ uri: point.image_url}}></Image>
                                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                </View>         
                            </Marker>);
                        })}
                    </MapView>)}
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20}}
                >
                {items.map(function(item){
                    return(<TouchableOpacity key={String(item.id)} 
                            style={[styles.item,
                                selectedItems.includes(item.id)? styles.selectedItem:{}
                            ]}
                            activeOpacity={0.6}
                            onPress={() => {handleSelectItem(item.id)}}>
                            <SvgUri width={42} height={42} uri={item.image_url}/>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>);
                })}
                </ScrollView>
            </View>
        </>
    );
}

export default Points;