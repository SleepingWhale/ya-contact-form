const myForm = $("#myForm");
const formInputs = {
  fio: $("[name='fio']"),
  email: $("[name='email']"),
  phone: $("[name='phone']"),
};
const submitButton = $("#submitButton");
const resultContainer = $("#resultContainer");
const regEmail = /^[A-Z0-9a-z._%+-]+@(ya\.ru|yandex\.ru|yandex\.ua|yandex.by|yandex\.kz|yandex\.com)$/;
const regPhone = /^\+(7)\(([0-9]{3})\)([0-9]{3})-([0-9]{2})-([0-9]{2})$/;
const maxPhoneDigitsSum = 30;
const inputValidators = {
  fio: (val) => {
    if (typeof val === 'string') {
      let count = 0;
      const words = val.split(' ');
      words.forEach(word => {
        if (word.length) {count += 1}
      });
      if (count === 3) {return true;}
    }
    return false;
  },
  email: (val) => {
    return regEmail.test(val);
  },
  phone: (val) => {
    if (!regPhone.test(val)) {return false;}
    const nParts = val.match(regPhone).slice(1);
    const total = nParts.reduce((sum, part) => {
      sum += part.split('').reduce((a, b) => a + Number(b), 0);
      return sum;
    }, 0);
    return maxPhoneDigitsSum >= total;
  },
};

function resetValidation() {
  const inputs = Object.values(formInputs);
  inputs.forEach(input => input.removeClass('error'));
}

function setValidationErrorStatus(field) {
  formInputs[field].addClass('error');
}

function request(data) {
  const url = myForm.prop('action');
  submitButton.prop('disabled', true);
  $.ajax({
    type: "POST",
    url,
    data,
  }).done(function(result) {
    switch (result.status) {
      case 'success':
        submitButton.prop('disabled', false);
        setStatus(result.status, 'succees');
        break;
      case 'error':
        setStatus(result.status, result.reason);
        submitButton.prop('disabled', false);
        break;
      case 'progress':
        console.log('progress');
        setStatus(result.status, 'progress');
        setTimeout(request.bind(this, data), result.timeout);
        break;
    }
  }).fail(function(e) {
    console.log('error', e);
  });
}

function resetStatus() {
  resultContainer.removeClass('error success');
  resultContainer.text('');
}

function setStatus(status, msg) {
  resultContainer.addClass(status);
  resultContainer.text(msg);
}

window.MyForm = {
  validate() {
    const data = this.getData();
    const keys = Object.keys(data);
    let result = { isValid: true, errorFields: [] };
    keys.forEach(key => {
      if (!inputValidators[key](data[key])) {
        result.isValid = false;
        result.errorFields.push(key);
      }
    });
    return result;
  },
  getData() {
    return {
      fio: formInputs.fio.val(),
      email: formInputs.email.val(),
      phone: formInputs.phone.val(),
    };
  },
  setData(data) {
    const keys = Object.keys(formInputs);
    keys.forEach(key => {
      const value = data[key];
      if (value) {
        formInputs[key].val(value);
      }
    })
  },
  submit() {
    resetValidation();
    resetStatus();
    const inputCheck = this.validate();
    if (inputCheck.isValid) {
      request(this.getData());
    } else {
      inputCheck.errorFields.forEach(setValidationErrorStatus);
    }
  },
};

submitButton.click(event => {
  event.preventDefault();
  MyForm.submit();
});
