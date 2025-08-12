import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { useColorScheme } from 'react-native';
import { light, dark } from '../theme/colors';

interface Availability {
  id: number;
  date: string;
  available: boolean;
}

export default function AvailabilityScreen() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? dark : light;

  useEffect(() => {
    supabase
      .from('availabilities')
      .select('*')
      .then(({ data }) => {
        if (data) setAvailabilities(data as Availability[]);
      });
  }, []);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        onChange: (_event, selected) => selected && setDate(selected),
      });
    } else {
      setShow(true);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Button title="Select Date" onPress={openPicker} color={colors.primary} />
      {show && Platform.OS === 'ios' && (
        <DateTimePicker
          value={date}
          onChange={(_e, d) => d && setDate(d)}
          style={{ width: '100%' }}
        />
      )}
      {availabilities.map((a) => (
        <Text key={a.id} style={{ color: colors.foreground, marginTop: 8 }}>
          {a.date}: {a.available ? 'Available' : 'Not available'}
        </Text>
      ))}
    </View>
  );
}
