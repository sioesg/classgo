import { BarCodeScanner } from "expo-barcode-scanner";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
}

export default function QRScannerModal({ visible, onClose, onScanned }: QRScannerModalProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: any) => {
    setScanned(true);
    onScanned(data);
    setTimeout(() => {
      onClose();
      setScanned(false);
    }, 800);
  };

  if (hasPermission === null) {
    return <Text style={styles.permissionText}>Solicitando permiso de cámara...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.permissionText}>No se otorgó acceso a la cámara</Text>;
  }

  return (
    <Modal animationType="slide" transparent={false} visible={visible}>
      <View style={styles.container}>
        <Text style={styles.title}>Escanea tu código QR</Text>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 20, marginBottom: 20 },
  camera: { width: "90%", height: "70%", borderRadius: 20 },
  closeButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#3A3B7B",
    padding: 12,
    borderRadius: 8,
  },
  closeText: { color: "#fff", fontWeight: "bold" },
  permissionText: { flex: 1, textAlign: "center", marginTop: 100, color: "#555" },
});
