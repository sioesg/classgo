// app/register.tsx
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebaseConfig";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const friendlyError = (code: string | undefined, message: string | undefined) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "El correo ya está en uso. Intenta con otro.";
      case "auth/invalid-email":
        return "El correo no tiene un formato válido.";
      case "auth/weak-password":
        return "La contraseña es muy débil. Usa al menos 6 caracteres.";
      case "auth/network-request-failed":
        return "Error de red. Revisa tu conexión.";
      case "auth/operation-not-allowed":
        return "El método de Email/Password no está habilitado en Firebase.";
      default:
        return message || "Ocurrió un error inesperado.";
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Guardar documento en Firestore en la colección "Usuarios"
      await setDoc(doc(db, "Usuarios", user.uid), {
        name: name.trim(),
        email: email.trim(),
        rol: "Estudiante",
        FechaCreacion: serverTimestamp(),
      });

      Alert.alert("Éxito", "Cuenta creada correctamente.");
      router.replace("/"); // redirige al login (index.tsx)
    } catch (error: any) {
      console.log("Firebase error object:", error);
      const code = error?.code;
      const msg = error?.message;
      const friendly = friendlyError(code, msg);
      Alert.alert(`Error (${code ?? "unknown"})`, friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ClassGo</Text>
      <Text style={styles.subtitle}>Crear cuenta</Text>

      <TextInput style={styles.input} placeholder="Nombre completo" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirmar contraseña" value={confirm} onChangeText={setConfirm} secureTextEntry />

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Creando cuenta..." : "Crear cuenta"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/")} style={{ marginTop: 12 }}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 36, fontWeight: "bold", color: "#3A3B7B", marginBottom: 10 },
  subtitle: { fontSize: 18, color: "#555", marginBottom: 30 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#3A3B7B",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: "#3A3B7B" },
});
