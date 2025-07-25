import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#333333',
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
    color: '#000000',
    marginBottom: 5,
    textAlign: 'center',
  },
  codeWord: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 3,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 11,
    color: '#333333',
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
    marginBottom: 10,
    color: '#000000',
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
}) => {
  // Create safe data without special characters
  const safeAlphabet = NATO_ALPHABET.map(item => ({
    letter: String(item.letter || ''),
    codeWord: String(item.codeWord || ''),
    pronunciation: String(item.pronunciation || '').replace(/[^A-Za-z0-9\s\-]/g, '')
  }));

  return (
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
          {safeAlphabet.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.letter}>{item.letter}</Text>
              <Text style={styles.codeWord}>{item.codeWord}</Text>
              <Text style={styles.pronunciation}>{item.pronunciation}</Text>
            </View>
          ))}
        </View>

        {/* Usage Guide */}
        {includeUsageGuide && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Use</Text>
            <Text style={styles.usageText}>
              Each letter is replaced with its corresponding code word
            </Text>
            <Text style={styles.usageText}>
              Example: ABC becomes Alpha Bravo Charlie
            </Text>
            <Text style={styles.usageText}>
              Speak clearly and pause between words
            </Text>
            <Text style={styles.usageText}>
              Used to avoid confusion in radio communications
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated from natophonetic.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};