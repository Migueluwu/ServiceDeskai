import React, { useRef, useState } from "react";
//import "../assets/Home.css";

function SimpleTicketForm() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isPhotoTaken, setIsPhotoTaken] = useState(false);
    const [location, setLocation] = useState(""); // Estado para ubicación
    const [status, setStatus] = useState("open"); // Estado para estado del ticket
    const [userId, setUserId] = useState(""); // Estado para userId (puedes obtener esto de la autenticación JWT)

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

        if (canvas && video) {
            const context = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const photoUrl = canvas.toDataURL("image/png");
            setPhoto(photoUrl);
            setIsPhotoTaken(true);
        }
    };

    const createTicket = async () => {
        if (!photo) return; // Asegúrate de que hay una foto

        const ticketData = {
            userId, // El ID del usuario que crea el ticket
            description: "Ticket creado automáticamente",
            media: [photo], // Enviar la imagen como parte del array de media
            geolocation: {
                type: "Point",
                coordinates: [0, 0], // Aquí puedes agregar la latitud y longitud reales si lo necesitas
            },
            status, // Añadir el estado del ticket
        };

		console.log(ticketData);
			try {
				await axios.post('http://localhost:3000/api/tickets', ticketData);
				alert('Ticket creado exitosamente');
				// Resetear campos
				setUserId('');
				setDescription('');
				setMedia('');
				setLongitude('');
				setLatitude('');
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
                    
                    {/* Añadiendo campos para ubicación y estado */}
                    <div style={{ marginTop: "20px" }}>
                        <label htmlFor="location">Location:</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            style={{ marginLeft: "10px" }}
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
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
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
