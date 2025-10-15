const ValidationManager = (function() {
  const validators = {
    url: {
      validate: (value) => {
        if (!value || value.trim() === '') {
          return 'URL is required';
        }
        
        try {
          const url = new URL(value);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return 'URL must use HTTP or HTTPS protocol';
          }
          return null;
        } catch (e) {
          return 'Please enter a valid URL';
        }
      }
    },
    
    title: {
      validate: (value) => {
        if (!value || value.trim() === '') {
          return 'Title is required';
        }
        
        if (value.trim().length < 3) {
          return 'Title must be at least 3 characters';
        }
        
        if (value.length > 200) {
          return 'Title must not exceed 200 characters';
        }
        
        return null;
      }
    },
    
    tags: {
      validate: (value) => {
        if (!value || value.trim() === '') {
          return null;
        }
        
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (tags.length > 20) {
          return 'Maximum 20 tags allowed';
        }
        
        for (const tag of tags) {
          if (tag.length > 50) {
            return 'Each tag must not exceed 50 characters';
          }
          
          if (!/^[a-zA-Z0-9-_\s]+$/.test(tag)) {
            return 'Tags can only contain letters, numbers, hyphens, and underscores';
          }
        }
        
        return null;
      }
    },
    
    notes: {
      validate: (value) => {
        if (value && value.length > 1000) {
          return 'Notes must not exceed 1000 characters';
        }
        return null;
      }
    },
    
    codeSnippet: {
      validate: (value) => {
        if (value && value.length > 5000) {
          return 'Code snippet must not exceed 5000 characters';
        }
        return null;
      }
    }
  };

  function validateField(fieldName, value) {
    const validator = validators[fieldName];
    if (!validator) {
      return null;
    }
    return validator.validate(value);
  }

  function validateForm(formData) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, value] of Object.entries(formData)) {
      const error = validateField(fieldName, value);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  function displayError(fieldName, errorMessage) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field && errorElement) {
      if (errorMessage) {
        field.classList.add('error');
        errorElement.textContent = errorMessage;
      } else {
        field.classList.remove('error');
        errorElement.textContent = '';
      }
    }
  }

  function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
      element.textContent = '';
    });
    
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => {
      field.classList.remove('error');
    });
  }

  function setupRealtimeValidation(fieldName) {
    const field = document.getElementById(fieldName);
    if (!field) return;

    let validationTimeout;
    
    field.addEventListener('input', () => {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        const error = validateField(fieldName, field.value);
        displayError(fieldName, error);
      }, 300);
    });

    field.addEventListener('blur', () => {
      const error = validateField(fieldName, field.value);
      displayError(fieldName, error);
    });
  }

  function parseTags(tagsString) {
    if (!tagsString || tagsString.trim() === '') {
      return [];
    }
    
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.toLowerCase());
  }

  return {
    validateField,
    validateForm,
    displayError,
    clearErrors,
    setupRealtimeValidation,
    parseTags
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationManager;
}
