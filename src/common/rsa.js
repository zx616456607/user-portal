import * as jsencrypt from 'jsencrypt'


const rsa = new jsencrypt.JSEncrypt()

rsa.setPublicKey(`-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlEyhTXp8FYbQbgzQ78/AdZFmL1Zgej4wNW8ybY7UrhjxSf14L+QyxdKnWGH/ThYC9EyJeCb4OGJKnrehNgZCX1BiauZDfmIVo8IeIrbCskTWdY9Mw+TCj1VVDLxoV60IhizzC0aatMKItWsTmesnZPPK8p2G1HNJ0s5viXGiBISJifyAW7IdEaOx220GQPV/RR89sCEuxCi/xpZdqkz+NujKEQJHySGuohXL5mmaLTNTrJQSA2bUyJfVDbqUi4qdLN+hbqyd6BWY691Diz3CK5ZLYMWnT1t6lF8iRp588Z+rA5H3jmMSgDrLCwthEQPgYBMrb622hTR52b+0kf9ClQIDAQAB-----END PUBLIC KEY-----`)
export default rsa
