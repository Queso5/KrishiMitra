import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db } from "../config/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
}

const EventAnnouncements = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Fetch upcoming events from Firestore
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Event),
      }));
      setEvents(eventList);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Agriculture Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text>{item.date}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default EventAnnouncements;

const styles = StyleSheet.create({
  container: { padding: 10 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  eventCard: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  eventTitle: { fontSize: 16, fontWeight: "bold" },
});
