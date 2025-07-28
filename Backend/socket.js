function configurarSockets(io) {
  io.on('connection', (socket) => {
    console.log('Socket conectado:', socket.id);

    socket.on('registrarDoctor', (doctorId) => {
      socket.join(`doctor_${doctorId}`);
      console.log(`Doctor ${doctorId} unido a su sala`);
    });

    socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });
  });
}

module.exports = configurarSockets;
