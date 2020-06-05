import React, { useEffect, useState } from 'react';
import { Feather as Icon, FontAwesome as IconFa } from '@expo/vector-icons';
import { View, Image, Text, SafeAreaView, Linking } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as MailComposer from 'expo-mail-composer';
import api from '../../services/api';
import styles from './styles';

interface Params {
    point_id: number;
}

interface Data {
    point: {
        image: string;
        name: string;
        image_url: string;
        email: string;
        whatsapp: string;
        city: string;
        uf: string;
    };
    items: {
        title: string;
    }[];
}

const Detail = () => {
    const [data, setData] = useState<Data>({} as Data);
    const navigation = useNavigation();
    const route = useRoute();

    const routeParam = route.params as Params;

    useEffect(() => {
        api.get(`/points/${routeParam.point_id}`).then(function(res){
            setData(res.data);
        });
    }, []);

    function handleNavigateBack(){
        navigation.goBack();
    }

    function handleWhatsapp(){
        Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&texto=Tenho interesse na coleta de resíduos.`);
    }

    function handleComposerMail(){
        MailComposer.composeAsync({
            subject: "Interesse na coleta de resíduos.",
            recipients: [data.point.email],

        });
    }

    if(!data.point){
        return null;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {handleNavigateBack()}}>
                    <Icon name="arrow-left" size={20} color="#34cb79"></Icon>
                </TouchableOpacity>

                <Image style={styles.pointImage}
                source={{ uri: data.point.image_url}}/>
                <Text style={styles.pointName}>{data.point.name}</Text>
                <Text style={styles.pointItems}>{data.items.map((item) => {return item.title}).join(', ')}</Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent}>{data.point.uf}, {data.point.city}</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={() => {handleWhatsapp()}}>
                    <IconFa name="whatsapp" size={20} color="#fff"/>
                    <Text style={styles.buttonText}>Whatsapps</Text>
                </RectButton>
                <RectButton style={styles.button} onPress={() => {handleComposerMail()}}>
                    <Icon name="mail" size={20} color="#fff"/>
                    <Text style={styles.buttonText}>E-mail</Text>
                </RectButton>
            </View>
        </SafeAreaView>
    );
}

export default Detail;