import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { useColorScheme } from 'react-native';
import { light, dark } from '../theme/colors';

interface Shift {
  id: number;
  title: string;
  start: string;
  end: string;
}

export default function ShiftsScreen() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? dark : light;

  useEffect(() => {
    supabase
      .from('shifts')
      .select('*')
      .then(({ data }) => {
        if (data) setShifts(data as Shift[]);
      });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: colors.secondary,
            }}
          >
            <Text style={{ color: colors.foreground }}>{item.title}</Text>
            <Text style={{ color: colors.foreground }}>
              {item.start} - {item.end}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
