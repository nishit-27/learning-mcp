
export default function getUserTime() {
    const userDate = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZoneName: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
  
    const formattedTime = userDate.toLocaleString(undefined, options);
    return formattedTime;
  }
  
  