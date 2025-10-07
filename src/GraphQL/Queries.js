// Mutation.js
import { gql } from '@apollo/client';

export const MY_DOCUMENT_QUERY = gql`
    query getPomsPatientDocumentList($id: token, $documentType: String) {
        PomsPatientDocumentList(_id: $id, documentType: $documentType) {
            documentUrl
            documentName
            practitionerId
            practitionerName
            documentType
            author
            organizationName
            createdOn
            id
        }
    }
`;
export const GET_PRICING_DETAILS = gql`
    query {
        Pricing {
            resourceType
            id
            name
            appointmentCancellationPricing1 {
            cancellationToDays
            cancellationAmount
            cancellationFromDays
            cancellationPriceType
            }
            
            appointmentCancellationPricing2 {
            cancellationToDays
            cancellationAmount
            cancellationFromDays
            cancellationPriceType
            }
            appointmentCancellationPricing3 {
            cancellationToDays
            cancellationAmount
            cancellationFromDays
            cancellationPriceType
            }
        }
    }
`;

export const GET_PRACTITIONER_LIST = gql`
  query GetPractitionerList($searchText: String) {
    PractitionerList(_text: $searchText) {
      id
      name {
        use
        family
        given
        prefix
      }
      band
      gender
      yearsOfExp
      ratings
      speciality
      subspeciality
      overAllRatings
      qualification {
        code {
          coding {
            system
            code
            display
          }
        }
      }
      communication {
        coding {
          system
          code
          display
        }
      }
      photo {
        url
      }
    }
  }
`;