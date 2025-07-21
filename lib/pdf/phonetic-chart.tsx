import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
});

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    padding: 40,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 10,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '30%',
    marginBottom: 15,
    padding: 10,
    border: '1 solid #E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  letter: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0EA5E9',
    marginBottom: 5,
    textAlign: 'center',
  },
  codeWord: {
    fontSize: 16,
    fontWeight: 600,
    color: '#0F172A',
    marginBottom: 3,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
    textAlign: 'center',
  },
  ipa: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  link: {
    color: '#0EA5E9',
    textDecoration: 'none',
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 10,
    color: '#0F172A',
  },
  usageText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 5,
    lineHeight: 1.5,
  },
});

interface PhoneticChartPDFProps {
  includeUsageGuide?: boolean;
}

export const PhoneticChartPDF: React.FC<PhoneticChartPDFProps> = ({ 
  includeUsageGuide = false 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NATO Phonetic Alphabet</Text>
        <Text style={styles.subtitle}>International Radiotelephony Spelling Alphabet</Text>
        <Text style={styles.subtitle}>Used by Military, Aviation, and Emergency Services</Text>
      </View>

      {/* Alphabet Grid */}
      <View style={styles.grid}>
        {NATO_ALPHABET.map((item) => (
          <View key={item.letter} style={styles.card}>
            <Text style={styles.letter}>{item.letter}</Text>
            <Text style={styles.codeWord}>{item.codeWord}</Text>
            <Text style={styles.pronunciation}>{item.pronunciation}</Text>
            <Text style={styles.ipa}>[{item.ipa}]</Text>
          </View>
        ))}
      </View>

      {/* Usage Guide */}
      {includeUsageGuide && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <Text style={styles.usageText}>
            • Each letter is replaced with its corresponding code word
          </Text>
          <Text style={styles.usageText}>
            • Example: &quot;ABC&quot; becomes &quot;Alpha Bravo Charlie&quot;
          </Text>
          <Text style={styles.usageText}>
            • Speak clearly and pause between words
          </Text>
          <Text style={styles.usageText}>
            • Used to avoid confusion in radio communications
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Generated from{' '}
          <Text style={styles.link}>phoneticalphabet.com</Text>
        </Text>
      </View>
    </Page>
  </Document>
);