// Mutation.js
import { gql } from '@apollo/client';

export const USER_LOGIN_MUTATION = gql`
  mutation UserLogin($email: String!, $password: String!) {
    UserLogin(
      resource: {
        resourceType: User,
        email: $email,
        password: $password,
        loginType: "Patient"
      }
    ) {
      status
      message
      details
      code
      tokenresult
    }
  }
`;

export const POMS_PATIENT_ACTIVITY_CREATE = gql`
  mutation PomsPatientActivityCreate($patientId: String!) {
    PomsPatientActivityCreate(
      resource: {
        resourceType: PomsPatientActivity,
        managingPatient: $patientId
      }
    ) {
      id
    }
  }
`;

export const PATIENT_QUERY = gql`
  query PatientQuery($patientId: ID!) {
    Patient(_id: $patientId) {
      patientMisc {
        gilikCompleted
      }
    }
  }
`;

export const APPOINTMENT_LIST = gql`
    query getAppointmentList($id: token) {
  PomsAppointmentList(_id: $id, _tag: "2") {
    id
    practitionerName
    practitionerId
    practitionerSpeciality
    appointmentDate
    appointmentTime
    slotId
    appointmentCreatedOn
    appointmentFor
    appointmentNumber
    appointmentBookedBy
    appointmentBookedId
    appointmentBookedDOB
    appointmentType
    appointmentMode
    appointmentDuration
    appointmentBookedByTitle
    appointmentBookedByFirstName
    appointmentBookedBySurName
    appointmentBookedByGender
    appointmentBookedByEmail
    appointmentBookedByPhoneNumber
    appointmentBookedForTitle
    appointmentBookedForFirstName
    appointmentBookedForSurName
    appointmentBookedForGender
    appointmentBookedForEmail
    appointmentBookedForPhoneNumber
    appointmentBookedForRelationship
    appointmentNeedLanguageSupport
    appointmentSpecialNotes
    appointmentPrice
    appointmentPayType
    appointmentPMIName
    appointmentPMIResponsibleParty
    appointmentPMIFirstName
    appointmentPMISurName
    appointmentGroupId
    appointmentMemberPolicyNumber
    appointmentExpiresOn
    appointmentPMIAuthorisationCode
    appointmentPMIAuthorisationSession
    appointmentThirdPartyName
    appointmentThirdPartyId
    appointmentThirdPartyComments
    appointmentPatientTechAbility
    appointmentPatientMentalAbility
    appointmentPatientConsent
    appointmentStatus
    videoSessionId
    videoSessionToken
    videoAPIKey
    videoAPISecret
    videoStartTime
    videoEndTime
    currentVideoTime
    isStartVideoClicked
    selfPayPaymentType
    appointmentSingleMulitple
    installmentDate
    multipleAppointmentDetails {
      installmentDate
      installmentAmount
      installmentPaidStatus
    }
  }
}
`;

export const Questionnaire = gql`
  query getPatientQuestionnaire($id: String, $timeline: String, $fetchingFrom: String, $assignedBy: String, $questionnaireName: String) {
    PatientQuestionnaireList(patientId: $id, timeline: $timeline, fetchingFrom: $fetchingFrom, assignedBy: $assignedBy, questionnaireName: $questionnaireName) {
      id
      resourceType
      patientId
      assignedId
      assignedName
      assignedType
      assignedSpeciality
      questitionerId
      status
      assignedOn
      questionnaire {
        id
        questionnaireName
        questionnaireDescription
        administeredType
        totalScore
        questions {
          question
          selectedOptionId
          selectedOptionText
          comments
          options {
            option
            optionId
            optionScore
          }
          optionType
          showCommentBox
          isCommentBoxRequired
        }
      }
    }
  }
`

export const PatientQuestionnaireUpdate = gql`
  mutation completeQuestionnaireBuilder($id: id, $questionnaire: QuestionnaireBuilder_Input, $status: String) {
  PatientQuestionnaireUpdate(
    resource: {resourceType: PatientQuestionnaire, id: $id, questionnaire: $questionnaire, status: $status}
  ) {
    id
  }
}`

export const SAVE_PATIENT_DOCUMENT = gql`
    mutation savePatientDocuments($id: String, $tags: [String], $documentUrl: String, $documentType: String, $author: String, $documentName: String, $organizationName: String, $practitionerId: String, $practitionerName: String, $documents: String, $fetchingFrom: String, $report_date: String
    ) {
  PomsPatientDocumentCreate(
    resource: {resourceType: PomsPatientDocuments, tags: $tags, patientId: $id, documentUrl: $documentUrl, documentType: $documentType, documentName: $documentName, author: $author, organizationName: $organizationName, practitionerId: $practitionerId, practitionerName: $practitionerName, documents: $documents, fetchingFrom: $fetchingFrom, report_date: $report_date}
  ) {
    id
  }
}
`;


export const POMS_APPOINTMENT_UPDATE = gql`
   mutation updatePomsAppointmentUpdateVideoToken($id: id) {
  PomsAppointmentUpdate(
    id: $id
    resource: {resourceType: PomsAppointment, appointmentStatusType: 1, appointmentStatus: "VideoToken", id: $id}
  ) {
    id
                practitionerName
                practitionerId
                practitionerSpeciality
                appointmentDate
                appointmentTime
                slotId
                appointmentBookedByFirstName
                appointmentBookedBySurName
                appointmentCreatedOn
                appointmentFor
                appointmentNumber
                appointmentBookedBy
                appointmentBookedId
                appointmentBookedDOB
                appointmentType
                appointmentMode
                appointmentDuration
                appointmentBookedByTitle
                appointmentBookedByFirstName
                appointmentBookedForSurName
                appointmentBookedForGender
                appointmentBookedForEmail
                appointmentBookedForPhoneNumber
                appointmentBookedForRelationship
                appointmentNeedLanguageSupport
                appointmentSpecialNotes
                appointmentPrice
                appointmentPayType
                appointmentPMIName
                appointmentPMIResponsibleParty
                appointmentPMIFirstName
                appointmentPMISurName
                appointmentGroupId
                appointmentMemberPolicyNumber
                appointmentExpiresOn
                appointmentPMIAuthorisationCode
                appointmentPMIAuthorisationSession
                appointmentThirdPartyName
                appointmentThirdPartyId
                appointmentThirdPartyComments
                appointmentPatientTechAbility
                appointmentPatientMentalAbility
                appointmentPatientConsent
                appointmentStatus
                videoSessionId
                videoAPIKey
                videoSessionToken
                videoAPISecret
                prescriptions {
                  id
                  comments
                  practitionerName
                  practitionerId
                  patientId
                  practitionerSpeciality
                  patientName
                  patientAddress
                  practitionerSignUrl
                  gmcNumber
                  dateofbirth
                  medications {
                    drugType
                    drugName
                    dosage
                    frequency
                    route
                    durationOfPrescription
                    neededToIncrease
                    neededToDecrease
                    furtherInstructions
                    anyChanges
                  }
                  prescriptionId
                  prescriptionDate
                  prescriptionFileUrl
                  prescriptionFileUrlName
                }
                letters {
                  id
                  templateName
                  templateMode
                  templateType
                  templateData
                  patientId
                  practitionerName
                  practitionerSpeciality
                  practitionerId
                  templateJsonData
                }
                diagnosis
                disorderDetails
                videoStartTime
                videoEndTime
                currentVideoTime
                isStartVideoClicked
  }
}
`;

export const POMS_APPOINTMENT_UPDATE_MUTATION = gql`
   mutation PomsAppointmentUpdate($id: String,
    $resourceType: String,
    $appointmentStatus: String,
    $cancellationPrice: String,
    $refundPrice: String,
    $cancellationType: String
   ) {
      PomsAppointmentUpdate(
        id: $id
        resource: {
          resourceType: $resourceType, 
          appointmentStatusType: 2, 
          appointmentStatus: $appointmentStatus, 
          id: $id, 
          cancellationPrice: $cancellationPrice, 
          refundPrice: $refundPrice, 
          cancellationType: $cancellationType}
      ) {
        id
      }
    }
  `;


  export const USER_REGISTRATION_MUTATION = gql`
  mutation UserRegistration(
    $firstName: String,
    $lastName: String,
    $email: String,
    $phoneNumber: String,
    $password: String,
    $year_of_birth: String,
    $guardianFirstName: String,
    $guardianSurname: String,
    $relationtoPatient: String
  ) {
    UserRegistration(
      resource: {
        resourceType: User, 
        firstName: $firstName, 
        lastName: $lastName, 
        email: $email, 
        phoneNumber: $phoneNumber, 
        password: $password, 
        year_of_birth: $year_of_birth,
        guardianFirstName: $guardianFirstName,
        guardianSurname: $guardianSurname,
        relationtoPatient: $relationtoPatient
      }
    ) {
      status
      message
    }
  }
`;

export const CONFIRM_USER_MUTATION = gql`
  mutation ConfirmUser(
    $email: String,
    $confirmation_code: String
  ) {
    ConfirmUser(
      resource: {
        resourceType: User, 
        email: $email, 
        confirmation_code: $confirmation_code
      }
    ) {
      status
      message
    }
  }
`;
export const RESEND_VERIFY_CODE = gql`
  mutation ResendConfirmation(
    $email: String
  ) {
    ResendConfirmation(
      resource: {
        resourceType: User, 
        email: $email
      }
    ) {
      status
      message
      details
      code
    }
  }
`;


export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    ForgotPassword(
      resource: {
        resourceType: User
        email: $email
      }
    ) {
      status
      message
      details
      code
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword(
    $email: String!, 
    $verificationCode: String!, 
    $newPassword: String!, 
    $userType: String!
  ) {
    ResetPassword(
      resource: {
        resourceType: User
        email: $email
        verificationCode: $verificationCode
        newPassword: $newPassword
        userType: $userType
      }
    ) {
      status
      message
      details
      code
    }
  }
`;

export const QUERY_UPDATE_PATIENT_VITALS = gql`
  mutation updatePatientVitals($id: id, $vitals: [Observation_Input]) {
    PatientUpdate(
      resource: {
        resourceType: Patient
        patientExtension: { operationType: "HEALTH_PROFILE_VITALS" }
        id: $id
        healthProfile: { vitals: $vitals }
      }
    ) {
      id
    }
  }
`;

export const DEACTIVATE_PATIENT = gql`
  mutation deactivatePatient($id: id) {
    PatientUpdate(
      resource: {
        resourceType: Patient
        patientExtension: { operationType: "DEACTIVATE" }
        id: $id
      }
    ) {
      id
      accountStatus
      fullName
    }
  }
`;

