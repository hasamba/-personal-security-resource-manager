-- Seed predefined security-related categories
INSERT INTO categories (name, description, is_predefined) VALUES
  ('Web Security', 'Resources related to web application security, OWASP, and common vulnerabilities', 1),
  ('Cryptography', 'Encryption, hashing, digital signatures, and cryptographic protocols', 1),
  ('Network Security', 'Firewall, VPN, network protocols, and network-level security measures', 1),
  ('Authentication & Authorization', 'Identity management, OAuth, SSO, and access control mechanisms', 1),
  ('Secure Coding', 'Best practices for writing secure code and avoiding common pitfalls', 1),
  ('Penetration Testing', 'Tools and techniques for ethical hacking and security assessments', 1),
  ('Incident Response', 'Security monitoring, threat detection, and incident handling', 1),
  ('Compliance & Standards', 'Security standards, regulations (GDPR, HIPAA, PCI-DSS), and compliance requirements', 1),
  ('Cloud Security', 'Security in cloud environments (AWS, Azure, GCP) and cloud-native security', 1),
  ('Mobile Security', 'Security considerations for iOS and Android applications', 1),
  ('API Security', 'REST API, GraphQL, and API security best practices', 1),
  ('DevSecOps', 'Security automation, CI/CD security, and infrastructure as code security', 1);
