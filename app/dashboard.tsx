// app/dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import { BarCodeScanner, BarCodeScannerResult } from "expo-barcode-scanner";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

export default function DashboardScreen(): React.JSX.Element {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [scanned, setScanned] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName((data && (data as any).name) || "Estudiante");
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/");
  };

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === "granted");
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se puede acceder a la cámara.");
    }
  };

  const handleOpenScanner = async () => {
    await requestCameraPermission();
    setScanned(false);
    setShowScanner(true);
  };

  const handleBarCodeScanned = (result: BarCodeScannerResult) => {
    const { type, data } = result;
    setScanned(true);
    Alert.alert("Código detectado", `Tipo: ${type}\nDato: ${data}`);
    setTimeout(() => setShowScanner(false), 1500); // Cierra el modal después de leer
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola,{userName}</Text>
            <Text style={styles.subtitle}>¡Ten un gran día!</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tarjetas principales */}
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="book-outline" size={28} color="#fff" />
            <Text style={styles.cardText}>Mis materias</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="calendar-outline" size={28} color="#fff" />
            <Text style={styles.cardText}>Mi horario</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="clipboard-outline" size={28} color="#fff" />
            <Text style={styles.cardText}>Tareas</Text>
          </TouchableOpacity>

          {/* Botón para abrir el escáner QR */}
          <TouchableOpacity style={styles.card} onPress={handleOpenScanner}>
            <Ionicons name="qr-code-outline" size={28} color="#fff" />
            <Text style={styles.cardText}>Escanear QR</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de progreso */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progreso reciente</Text>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Diseño UI</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "70%" }]} />
            </View>
            <Text style={styles.progressText}>70% completado</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal con la cámara */}
      <Modal visible={showScanner} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Escanear código QR</Text>
          {hasPermission === false ? (
            <Text style={{ color: "#fff" }}>No se ha otorgado permiso para la cámara.</Text>
          ) : (
            <View style={styles.scannerBox}>
              <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", paddingHorizontal: 20 },
  header: {
    backgroundColor: "#3A3B7B",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "#ddd", fontSize: 14, marginTop: 4 },
  cardContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 25 },
  card: {
    backgroundColor: "#3A3B7B",
    width: "47%",
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardText: { color: "#fff", fontWeight: "600", marginTop: 10 },
  section: { marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  progressTitle: { fontWeight: "600", marginBottom: 10 },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3A3B7B",
    borderRadius: 10,
  },
  progressText: { fontSize: 12, color: "#777", marginTop: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#555" },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scannerBox: {
    width: "90%",
    height: "70%",
    overflow: "hidden",
    borderRadius: 20,
  },
  closeButton: {
    backgroundColor: "#3A3B7B",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 30,
  },
  closeText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
