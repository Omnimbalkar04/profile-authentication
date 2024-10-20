import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailtrapClient, sender } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipients = [{email}]

  try {
    const response = await mailtrapClient.send({
      from:sender,
      to: recipients,
      subject:"Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category: "Email Verification"
    })

    console.log("Email sent", response)
  } catch (error) {
    console.error(`Error sending verification`, error);

    throw new Error(`Error sending verification email: ${error}`);
  }
}

export const sendWelcomeEmail = async (email, name) => {
  const recipients = [{email}];

  try {
    
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      template_uuid: "57f7e336-060c-4460-bb23-0972019ee208",
      template_variables:{
        "company_info_name": "Yoo Company",
        "name": name
      },
    })

    console.log("Welcome Email Sent..", response)
  } catch (error) {
    console.error(`Error sending Welcome Email`, error);

    throw new Error(`Error sending Welcome Email: ${error}`);
  }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipients = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password reset",
    })
  } catch (error) {
    console.error(`Error Password Reset`, error);

    throw new Error(`Error Password Reset email: ${error}`);
  }
}

export const sendResetSuccessEmail = async (email) => {
  const recipients = [{email}];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset"
    })
  } catch (error) {
    console.error(`Error Password Reset Success`, error);

    throw new Error(`Error Password Reset Success email: ${error}`);
  }
}