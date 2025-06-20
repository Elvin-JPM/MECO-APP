// Helper function to format date as "DD-MM-YYYY HH:mm"
export function formatDate(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

export function formatDateInput(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function newReportName() {
  // Genera una estampa de tiempo que se usa para identificar el reporte
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  return `VS_${year}_${month}_${day}_${hour}_${minute}_${second}`;
}

export function getOclockDate(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day} 00:00`;
}

export function getYesterdayDateFormatted() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const day = String(yesterday.getDate()).padStart(2, "0");
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const year = yesterday.getFullYear();

  const hours = String(yesterday.getHours()).padStart(2, "0");
  const minutes = String(yesterday.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/// Regresa el tiempo en transcurrido entre dos fechas

export function getTimeDifference(currentDateStr, pastDateStr) {
  // Handle null or undefined dates
  if (!currentDateStr || !pastDateStr) {
    return "0 segundos";
  }

  const currentDate = new Date(currentDateStr);
  const pastDate = new Date(pastDateStr);

  // Validate dates
  if (isNaN(currentDate.getTime()) || isNaN(pastDate.getTime())) {
    return "0 segundos";
  }

  const diffInSeconds = Math.floor((currentDate - pastDate) / 1000);

  // Handle negative differences
  if (diffInSeconds <= 0) {
    return "0 segundos";
  }

  // Calculate all time units
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  // Helper function for pluralization
  const pluralize = (value, singular, plural) =>
    value === 1 ? singular : plural;

  // 1. Less than 1 minute: show seconds
  if (diffInSeconds < 60) {
    return `${diffInSeconds} ${pluralize(
      diffInSeconds,
      "segundo",
      "segundos"
    )}`;
  }

  // 2. Between 1 minute and 1 hour: show minutes and seconds
  if (minutes < 60) {
    const remainingSeconds = diffInSeconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} ${pluralize(minutes, "minuto", "minutos")}`;
    }
    return `${minutes} ${pluralize(
      minutes,
      "minuto",
      "minutos"
    )} y ${remainingSeconds} ${pluralize(
      remainingSeconds,
      "segundo",
      "segundos"
    )}`;
  }

  // 3. Between 1 hour and 1 day: show hours and minutes
  if (hours < 24) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${pluralize(hours, "hora", "horas")}`;
    }
    return `${hours} ${pluralize(
      hours,
      "hora",
      "horas"
    )} y ${remainingMinutes} ${pluralize(
      remainingMinutes,
      "minuto",
      "minutos"
    )}`;
  }

  // 4. Between 1 day and 1 month: show days and hours
  if (days < 30) {
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} ${pluralize(days, "día", "días")}`;
    }
    return `${days} ${pluralize(
      days,
      "día",
      "días"
    )} y ${remainingHours} ${pluralize(remainingHours, "hora", "horas")}`;
  }

  // 5. Between 1 month and 1 year: show months and days
  if (months < 12) {
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `${months} ${pluralize(months, "mes", "meses")}`;
    }
    return `${months} ${pluralize(
      months,
      "mes",
      "meses"
    )} y ${remainingDays} ${pluralize(remainingDays, "día", "días")}`;
  }

  // 6. More than 1 year: show years and months
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} ${pluralize(years, "año", "años")}`;
  }
  return `${years} ${pluralize(
    years,
    "año",
    "años"
  )} y ${remainingMonths} ${pluralize(remainingMonths, "mes", "meses")}`;
}
