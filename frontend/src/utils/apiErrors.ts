export interface ApiErrors {
  global: string | null;
  fields: Record<string, string>;
}

export const parseApiErrors = (error: any): ApiErrors => {
  const result: ApiErrors = { global: null, fields: {} };

  if (error?.response?.data) {
    const data = error.response.data;

    // Handle 'detail' (common in simplejwt/drf generic views)
    if (typeof data.detail === 'string') {
      result.global = data.detail;
    }

    // Handle 'non_field_errors' (common in DRF)
    if (data.non_field_errors) {
      const msg = Array.isArray(data.non_field_errors) 
        ? data.non_field_errors.join(' ') 
        : String(data.non_field_errors);
      result.global = result.global ? `${result.global} ${msg}` : msg;
    }

    // Handle standard field errors
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'detail' || key === 'non_field_errors') return;

      if (Array.isArray(value)) {
        result.fields[key] = value.join(' ');
      } else if (typeof value === 'string') {
        result.fields[key] = value;
      }
    });

    // If we have data but no known keys matched above (fallback)
    if (!result.global && Object.keys(result.fields).length === 0) {
       // If it's a string, maybe it's a raw error message
       if (typeof data === 'string') {
           result.global = data;
       } else {
           result.global = "Une erreur est survenue lors du traitement de la requête.";
       }
    }

  } else if (error?.message) {
    result.global = error.message;
  } else {
    result.global = "Une erreur inconnue est survenue. Veuillez réessayer.";
  }
  
  return result;
};
