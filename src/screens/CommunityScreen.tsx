import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  StyleSheet,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db, auth } from "../config/firebase"; 
import Header from "../components/Header"; 
import RemixIcon from "react-native-remix-icon";
import { Picker } from "@react-native-picker/picker"; // ✅ Import Picker
import CommunityMarquee from "../screens/CommunityMarquee"; // ✅ Import the Marquee



interface Community {
  id: string;
  name: string;
  description: string;
  category: string; // ✅ Added category for filtering
}

const communityCategories = [
  "None",
  "General",
  "Agriculture",
  "Organic Farming",
  "Dairy Farming",
  "Fruits & Vegetables",
  "Fertilizers & Pesticides",
  "Irrigation Techniques",
];


const CommunityScreen = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // ✅ Add state for category
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDescription, setNewCommunityDescription] = useState("");
  const [newCommunityCategory, setNewCommunityCategory] = useState("General"); // Default category
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  const user = auth.currentUser; // ✅ Get logged-in user
  const navigation = useNavigation();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "communities"));
      const communityList: Community[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Community),
      }));
      
      setCommunities(communityList);
      setFilteredCommunities(communityList);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const createCommunity = async () => {
    if (!newCommunityName.trim()) return;
  
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No user logged in");
        return;
      }
  
      const docRef = await addDoc(collection(db, "communities"), {
        name: newCommunityName,
        description: newCommunityDescription || "-",
        category: newCommunityCategory,
        createdBy: user.uid,  // ✅ Save creator's user ID
        createdAt: Timestamp.now(),
      });
  
      const newCommunity = { 
        id: docRef.id, 
        name: newCommunityName, 
        description: newCommunityDescription, 
        category: newCommunityCategory, 
        createdBy: user.uid,  // ✅ Store creator ID in the state
      };
  
      setCommunities([...communities, newCommunity]);
      applyFilters(newCommunityCategory, searchQuery);
      setModalVisible(false);
      setNewCommunityName("");
      setNewCommunityDescription("");
      setNewCommunityCategory("General");
    } catch (error) {
      console.error("Error creating community:", error);
    }
  };
  
  
const [, forceUpdate] = useState(0);

const confirmDeleteCommunity = (communityId: string) => {
  setSelectedCommunityId(communityId);
  setShowDeleteModal(true);
  forceUpdate((n) => n + 1); // ✅ Force React to update UI
};
  
  
  
  const deleteCommunity = async (communityId: string) => {
    try {
      await deleteDoc(doc(db, "communities", communityId));
      setCommunities(communities.filter((c) => c.id !== communityId));
      setFilteredCommunities(filteredCommunities.filter((c) => c.id !== communityId));
      setShowDeleteModal(false); // ✅ Close modal AFTER deletion
    } catch (error) {
      console.error("Error deleting community:", error);
    }
  };  
  
  

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(selectedCategory, query);
  };

  const applyFilters = (category: string, query: string) => {
    let filtered = communities;

    if (category !== "None") {
      filtered = filtered.filter((community) => community.category === category);
    }

    if (query.trim() !== "") {
      filtered = filtered.filter((community) =>
        community.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredCommunities(filtered);
  };

  const handleFilterSelect = (category: string) => {
    setSelectedCategory(category);
    setFilterModalVisible(false);
    applyFilters(category, searchQuery);
  };

  const resetFilters = () => {
    setSelectedCategory("None");
    setSearchQuery("");
    setFilteredCommunities(communities);
    setFilterModalVisible(false);
  };
  

  const handleNavigateToChat = (communityId: string, communityName: string) => {
    navigation.navigate("ChatScreen", {
      communityId: communityId,
      communityName: communityName,
    });
  };

    return (
      <View style={{ flex: 1 }}>
        <Header />

        {/* ✅ Marquee Component */}
        <CommunityMarquee />


        <View style={styles.container}>

          {/* ✅ Search & Filter Section */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search communities..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
              <RemixIcon name="filter-fill" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.createButtonText}>+ Create Community</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#A3CB38" />
          ) : filteredCommunities.length === 0 ? (
            <Text style={styles.noCommunitiesText}>No communities found.</Text>
          ) : (
            <FlatList
              data={filteredCommunities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.communityCard}>
                  <TouchableOpacity onPress={() => navigation.navigate("ChatScreen", { communityId: item.id, communityName: item.name })}>
                    <Text style={styles.communityName}>{item.name}</Text>
                    <Text style={styles.communityDescription}>{item.description}</Text>
                    <Text style={styles.communityCategory}>#{item.category}</Text>
                  </TouchableOpacity>

                  {/* ✅ Show delete button only for community creator */}
                  {auth.currentUser?.uid === item.createdBy && (
                    <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteCommunity(item.id)}>
                      <RemixIcon name="delete-bin-5-line" size={24} color="#c9302c" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}

          {/* ✅ Modal for Creating Community */}
          <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Create Community</Text>

              {/* ✅ Community Name Input */}
              <TextInput
                placeholder="Community Name"
                value={newCommunityName}
                onChangeText={setNewCommunityName}
                style={styles.input}
              />

              {/* ✅ Description Input */}
              <TextInput
                placeholder="Description"
                value={newCommunityDescription}
                onChangeText={setNewCommunityDescription}
                style={styles.input}
              />

              {/* ✅ Category Selector */}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newCommunityCategory}
                  onValueChange={(itemValue) => setNewCommunityCategory(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Category" value="" />
                  {communityCategories.map((category, index) => (
                    <Picker.Item key={index} label={category} value={category} />
                  ))}
                </Picker>
              </View>


              {/* ✅ Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={createCommunity}>
                  <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>;

          {/* ✅ Modal for Filtering Communities */}
          <Modal visible={filterModalVisible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>Filter by Category</Text>
                {communityCategories.map((category) => (
                  <TouchableOpacity key={category} style={styles.filterOption} onPress={() => handleFilterSelect(category)}>
                    <Text style={styles.filterText}>{category}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.filterButtonsContainer}>
                  <TouchableOpacity style={[styles.filterButtonStyle, styles.cancelButton]} onPress={() => setFilterModalVisible(false)}>
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* ✅ Delete Confirmation Modal */}
          <Modal visible={showDeleteModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer2}>
                <Text style={styles.modalHeader2}>Delete Community?</Text>
                <Text style={styles.modalText}>This action is irreversible.</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.cancelButton2} onPress={() => setShowDeleteModal(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton2} 
                    onPress={() => deleteCommunity(selectedCommunityId)} // ✅ Pass correct ID
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>


        </View>
      </View>
    );
  };

// ✅ Updated Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
    marginBottom: 90,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginTop: -5,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#E8F5E9",
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    backgroundColor: "#A3CB38",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#84a52b",
  },
  createButton: {
    backgroundColor: "#A3CB38",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
    borderWidth: 2,
    borderColor: "#84a52b",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    
  },
  noCommunitiesText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
  communityCategory: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#A3CB38",
    marginTop: 5,
    alignSelf: "flex-start", // Ensures proper alignment
    backgroundColor: "#E8F5E9", // Light green background
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  communityCard: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 8,
    borderRadius: 10,
    elevation: 2,
  },
  communityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2B5E18",
  },
  communityDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
    color: "#224a13",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: "#ccc",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#2B5E18",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "#224a13",
  },
  cancelButton: {
    backgroundColor: "#c9302c",
    borderColor: "#a82925",
    borderWidth: 2,
  },
  closeButton: {
    backgroundColor: "#c9302c",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#224a13",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  picker: {
    width: "100%",
    height: 60, // ✅ Matches container height
    textAlign: "center", // ✅ Centers text in some devices
    textAlignVertical: "center", // ✅ Ensures vertical centering in Android
    color: "#060606",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  filterOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  filterText: {
    fontSize: 16,
    color: "#2B5E18",
  },
  filterButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  filterButtonStyle: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2B5E18",
    alignItems: "center",
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: "#c9302c", // ✅ Red color for Reset
    borderWidth: 2,
    borderColor: "#a82925",
  },

  deleteButton: {
    position: "absolute", // ✅ Positions it within the container
    top: 10, // ✅ Places it at the top
    right: 10, // ✅ Aligns it to the right
    padding: 8,
    backgroundColor: "#fdecea",
    borderRadius: 8,
  },

  //community delete
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay for better visibility
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer2: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    elevation: 10, // Subtle shadow effect
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#E8F5E9",
  },
  modalHeader2: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#c9302c", // Danger color for emphasis
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton2: {
    flex: 1,
    backgroundColor: "#bbb", // Neutral gray for cancel
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
    borderColor: "#aaa",
    borderWidth: 2,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  deleteButton2: {
    flex: 1,
    backgroundColor: "#c9302c", // Bright red delete button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderColor: "#a82925",
    borderWidth: 2,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default CommunityScreen;
