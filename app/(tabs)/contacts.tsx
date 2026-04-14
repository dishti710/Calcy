import ToggleSwitch from '@/components/ToggleSwitch';
import { COLORS } from '@/constants/colors';
import { getEmergencySMSPreview, sendTestSMS } from '@/services/sms';
import { addContact, getContacts, removeContact, updateContact } from '@/services/storage';
import { TrustedContact } from '@/types';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    try {
      setIsAddingContact(true);
      const contact: TrustedContact = {
        id: Date.now().toString(),
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        email: newContactEmail.trim() || undefined,
        smsOnSOS: true,
        locationOnSOS: true,
        isPrimary: contacts.length === 0,
      };

      await addContact(contact);
      setContacts([...contacts, contact]);

      // Reset form
      setNewContactName('');
      setNewContactPhone('');
      setNewContactEmail('');
      setShowAddModal(false);

      Alert.alert('Success', 'Contact added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add contact');
      console.error('Error:', error);
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleRemoveContact = (contactId: string) => {
    Alert.alert('Remove Contact', 'Are you sure you want to remove this contact?', [
      { text: 'Cancel' },
      {
        text: 'Remove',
        onPress: async () => {
          try {
            await removeContact(contactId);
            setContacts(contacts.filter(c => c.id !== contactId));
            Alert.alert('Removed', 'Contact removed successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to remove contact');
          }
        },
      },
    ]);
  };

  const handleTestSMS = async (contactId: string) => {
    try {
      await sendTestSMS(contactId);
      Alert.alert('Test SMS', 'Test message sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test SMS');
    }
  };

  const handleToggleSMS = async (contactId: string, currentValue: boolean) => {
    try {
      await updateContact(contactId, { smsOnSOS: !currentValue });
      setContacts(
        contacts.map(c =>
          c.id === contactId ? { ...c, smsOnSOS: !currentValue } : c
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update contact');
    }
  };

  const handleToggleLocation = async (contactId: string, currentValue: boolean) => {
    try {
      await updateContact(contactId, { locationOnSOS: !currentValue });
      setContacts(
        contacts.map(c =>
          c.id === contactId ? { ...c, locationOnSOS: !currentValue } : c
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update contact');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.LAV_500} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.header}>Trusted Contacts</Text>
        <Text style={styles.subHeader}>
          They'll receive your SOS SMS with live location
        </Text>

        {/* Contacts List */}
        {contacts.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Your Contacts ({contacts.length})</Text>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                {/* Header */}
                <View style={styles.contactCardHeader}>
                  <View style={styles.avatarLg}>
                    <Text style={styles.avatarText}>
                      {contact.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </Text>
                  </View>
                  <View style={styles.contactCardInfo}>
                    <Text style={styles.contactCardName}>{contact.name}</Text>
                    <Text style={styles.contactCardNum}>{contact.phone}</Text>
                    {contact.isPrimary && (
                      <View style={styles.badgePrimary}>
                        <Text style={styles.badgePrimaryText}>● Primary Contact</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Settings */}
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>SMS on SOS</Text>
                  <ToggleSwitch
                    value={contact.smsOnSOS}
                    onValueChange={() => handleToggleSMS(contact.id, contact.smsOnSOS)}
                  />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Include live location</Text>
                  <ToggleSwitch
                    value={contact.locationOnSOS}
                    onValueChange={() => handleToggleLocation(contact.id, contact.locationOnSOS)}
                  />
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleTestSMS(contact.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionBtnText}>✉️ Test SMS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDanger]}
                    onPress={() => handleRemoveContact(contact.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionBtnTextDanger}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {/* Add Contact Card */}
        <TouchableOpacity
          style={styles.addContactLarge}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addIcon}>➕</Text>
          <Text style={styles.addTitle}>Add a trusted contact</Text>
          <Text style={styles.addSub}>
            {contacts.length === 0
              ? 'Add your first contact to receive SOS alerts'
              : `You can add up to ${5 - contacts.length} more contacts`}
          </Text>
        </TouchableOpacity>

        {/* SMS Preview */}
        <Text style={styles.sectionTitle}>SMS Preview on SOS</Text>
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>MESSAGE THAT WILL BE SENT:</Text>
          <View style={styles.previewMessage}>
            <Text style={styles.previewText}>{getEmergencySMSPreview('Sarah')}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Trusted Contact</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                disabled={isAddingContact}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contact name"
                  value={newContactName}
                  onChangeText={setNewContactName}
                  editable={!isAddingContact}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  value={newContactPhone}
                  onChangeText={setNewContactPhone}
                  keyboardType="phone-pad"
                  editable={!isAddingContact}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="contact@email.com"
                  value={newContactEmail}
                  onChangeText={setNewContactEmail}
                  keyboardType="email-address"
                  editable={!isAddingContact}
                />
              </View>

              <TouchableOpacity
                style={[styles.btnAdd, isAddingContact && styles.btnDisabled]}
                onPress={handleAddContact}
                disabled={isAddingContact}
                activeOpacity={0.7}
              >
                <Text style={styles.btnAddText}>
                  {isAddingContact ? 'Adding...' : 'Add Contact'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setShowAddModal(false)}
                disabled={isAddingContact}
                activeOpacity={0.7}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.LAV_800,
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 12,
    color: COLORS.LAV_400,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.LAV_500,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.LAV_100,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  contactCardHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarLg: {
    width: 48,
    height: 48,
    borderRadius: 50,
    backgroundColor: COLORS.LAV_100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.LAV_200,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.LAV_700,
  },
  contactCardInfo: {
    flex: 1,
  },
  contactCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.LAV_800,
  },
  contactCardNum: {
    fontSize: 12,
    color: COLORS.LAV_400,
    marginTop: 2,
  },
  badgePrimary: {
    marginTop: 4,
  },
  badgePrimaryText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '600',
  },
  settingRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LAV_50,
  },
  settingLabel: {
    fontSize: 12,
    color: COLORS.LAV_600,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.LAV_50,
    borderWidth: 1.5,
    borderColor: COLORS.LAV_200,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.LAV_700,
  },
  actionBtnDanger: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  actionBtnTextDanger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b91c1c',
  },
  addContactLarge: {
    backgroundColor: COLORS.LAV_50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.LAV_300,
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  addTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.LAV_500,
  },
  addSub: {
    fontSize: 11,
    color: COLORS.LAV_400,
    marginTop: 4,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.LAV_100,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 11,
    color: COLORS.LAV_500,
    marginBottom: 8,
    fontWeight: '600',
  },
  previewMessage: {
    backgroundColor: COLORS.LAV_50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  previewText: {
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 20,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.LAV_800,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.LAV_300,
  },
  modalForm: {
    marginBottom: 12,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: COLORS.LAV_600,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.LAV_200,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  btnAdd: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: COLORS.LAV_500,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnAddText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  btnCancel: {
    width: '100%',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: COLORS.LAV_200,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnCancelText: {
    color: COLORS.LAV_500,
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});