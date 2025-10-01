class HorariosDisponibles {
  horarios() {
    return [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
    ];
  }

  duraciones() {
    return {
      evaluacion: 30,
      procedimiento: 60,
    };
  }
}

module.exports = new HorariosDisponibles();
