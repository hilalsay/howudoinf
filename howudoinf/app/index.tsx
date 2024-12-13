import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
//import axios from "axios";

export default function Index() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data from your backend
  const fetchData = async () => {
    setLoading(true);
    setError(null); // Reset error before new request
    // try {
    //   const response = await axios.get("http://10.0.2.2:8080/api/endpoint");
    //   setData(response.data);
    // } catch (err) {
    //   setError("Error fetching data");
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the React Native App</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : data ? (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>Data from Backend:</Text>
          <Text style={styles.dataText}>{JSON.stringify(data)}</Text>
        </View>
      ) : (
        <Text style={styles.noData}>No data available</Text>
      )}
      <Button title="Fetch Data Again" onPress={fetchData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  error: {
    color: "red",
    marginTop: 20,
  },
  dataContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  dataText: {
    fontSize: 16,
    marginBottom: 10,
  },
  noData: {
    fontSize: 16,
    color: "gray",
    marginTop: 20,
  },
});
