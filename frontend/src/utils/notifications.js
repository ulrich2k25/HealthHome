export default async function scheduleNotification(title, message, dateTime) {
  if (!("Notification" in window)) {
    console.warn("Notifications non supportées par ce navigateur");
    return;
  }

  try {
    // ✅ Conversion locale explicite (évite le bug du 29)
    const now = new Date();

    // On découpe dateTime (format "YYYY-MM-DDTHH:mm")
    const [datePart, timePart] = dateTime.split("T");
    const [hours, minutes] = timePart.split(":");

    // Construit la date locale sans décalage UTC
    const [year, month, day] = datePart.split("-").map(Number);
    const target = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes), 0, 0);

    const delay = target.getTime() - now.getTime();

    console.log("⏰ DEBUG Notification -------------------");
    console.log("Maintenant :", now.toISOString());
    console.log("Cible (locale):", target.toString());
    console.log("Délai (ms):", delay);
    console.log("----------------------------------------");

    if (isNaN(target.getTime())) {
      console.warn("❌ Date invalide :", dateTime);
      return;
    }

    if (delay <= 0) {
      console.warn("L’heure est déjà passée, aucune notification planifiée.");
      return;
    }

    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }

    if (Notification.permission === "granted") {
      console.log(`✅ Notification programmée dans ${Math.round(delay / 1000)} secondes`);
      setTimeout(() => {
        new Notification(title, { body: message });
      }, delay);
    } else {
      console.warn("⚠️ Permission de notification refusée.");
    }
  } catch (err) {
    console.error("Erreur lors de la planification de la notification :", err);
  }
}
