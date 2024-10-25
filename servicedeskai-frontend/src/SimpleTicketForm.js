import React, { useRef, useState } from "react";
import axios from 'axios';  // Importar axios

function SimpleTicketForm() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isPhotoTaken, setIsPhotoTaken] = useState(false);
    const [location, setLocation] = useState(""); // Estado para ubicación
    const [status, setStatus] = useState("unreviewed"); // Estado para estado del ticket
    const [userId, setUserId] = useState("12345"); // Asignar un valor predeterminado para userId
    const [description, setDescription] = useState(""); // Estado para descripción del ticket

    const startCamera = async () => {
        setLoading(true);
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            setError("Error accessing the camera. Please check your permissions.");
            console.error("Error accessing the camera: ", error);
        } finally {
            setLoading(false);
        }
    };

    const takePhoto = () => {
		const canvas = canvasRef.current;
		const video = videoRef.current;
	
		if (!video || video.paused || video.ended) {
			alert("Video is not ready. Please ensure the camera is working.");
			return;
		}
	
		if (canvas) {
			const context = canvas.getContext("2d");
			const maxWidth = 640; // Ancho máximo
			const maxHeight = 480; // Alto máximo
	
			// Calcular la relación de aspecto
			const width = video.videoWidth;
			const height = video.videoHeight;
			const ratio = Math.min(maxWidth / width, maxHeight / height);
	
			const newWidth = width * ratio;
			const newHeight = height * ratio;
	
			// Establecer las dimensiones del canvas
			canvas.width = newWidth;
			canvas.height = newHeight;
	
			context.drawImage(video, 0, 0, newWidth, newHeight);
			const photoUrl = canvas.toDataURL("image/jpeg", 0.7); // Comprimir a JPEG con calidad 70%
			setPhoto(photoUrl);
			setIsPhotoTaken(true);
			
		}
	};

    // Función para obtener la ubicación del usuario
    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve([position.coords.longitude, position.coords.latitude]); // [lng, lat]
                    },
                    (error) => {
                        reject(error);
                    }
                );
            } else {
                reject(new Error("Geolocation is not supported by this browser."));
            }
        });
    };

    const createTicket = async () => {
		if (!photo || !description) {
			alert("Please fill in all required fields.");
			return;
		}

		// Verificar que photo contiene una URL válida en base64
	
	
		try {

			// Convertir la imagen capturada (base64) en un archivo blob
			
		
			// Crear un objeto FormData para enviar los datos
			const formData = new FormData();
			formData.append('userId', userId);
			formData.append('description', description);
			formData.append('media', photoUrl);
			formData.append('geolocation', JSON.stringify({
				type: "Point",
				coordinates: location || await getLocation(), // Obtener ubicación automáticamente si no está manualmente.
			}));
			formData.append('status', status);

			// Enviar el ticket
			await axios.post('http://localhost:3000/api/tickets', formData, {
				headers: {
					'Content-Type': 'multipart/form-data', // Importante para manejo de archivos
				},
			});
		
			alert('Ticket creado exitosamente');
			// Restablecer campos
			setUserId('');
			setPhoto(null);
			setLocation('');
			setDescription('');
			setStatus('unreviewed');
		} catch (error) {
			console.error('Error al crear el ticket:', error);
			alert('Error al crear el ticket');
		}
	};
	

    return (
        <div className="home">
            <h1>Welcome to DeskAI</h1>
            <p>Your go-to solution for managing desk reports and issues efficiently.</p>
            <button className="button" onClick={startCamera}>
                {loading ? "Activating Camera..." : "Start Your Ticket"}
            </button>
            {error && <p className="error-message">{error}</p>}
            {!isPhotoTaken ? (
                <video
                    ref={videoRef}
                    autoPlay
                    style={{
                        marginTop: "20px",
                        width: "100%",
                        maxWidth: "600px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    }}
                />
            ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
                    <img
                        src={photo}
                        alt="Captured"
                        style={{
                            borderRadius: "10px",
                            maxWidth: "100%",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        }}
                    />
                    
                    {/* Añadiendo campos para descripción, ubicación y estado */}
                    <div style={{ marginTop: "20px" }}>
                        <label htmlFor="description">Description:</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ marginLeft: "10px", width: "200px" }}
                            placeholder="Enter ticket description"
                        />
                    </div>
                    <div style={{ marginTop: "20px" }}>
                        <label htmlFor="location">Location:</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            style={{ marginLeft: "10px", width: "200px" }}
                            placeholder="Enter location"
                        />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                        <label htmlFor="status">Status:</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={{ marginLeft: "10px" }}
                        >
                            <option value="unreviewed">Unreviewed</option>
                            <option value="in_review">In Review</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>

                    <button className="button" style={{ marginTop: "20px" }} onClick={createTicket}>Create Ticket</button>
                </div>
            )}
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            {!isPhotoTaken && <button className="button" onClick={takePhoto}>Take Photo</button>}
        </div>
    );
}

export default SimpleTicketForm;
