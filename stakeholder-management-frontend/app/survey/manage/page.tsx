"use client"

import { useState, useEffect, FormEvent } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash, Eye, Search, Share2 } from 'lucide-react'
import Layout from '@/components/layout/Layout';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { BarChartIcon } from '@radix-ui/react-icons'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)


// Mock data (replace with actual API calls in a real application)
const initialSurveys = [
  { id: 1, title: "Customer Satisfaction Survey", description: "We would like to know your feedback on our services." },
  { id: 2, title: "Product Feedback Survey", description: "Please provide your thoughts on our latest product." },
]

const initialQuestions = [
  { id: 1, surveyId: 1, questionText: "How satisfied are you with our service?", questionType: "rating", choices: ["1", "2", "3", "4", "5"] },
  { id: 2, surveyId: 1, questionText: "What can we do to improve?", questionType: "text" },
  { id: 3, surveyId: 2, questionText: "How likely are you to recommend our product?", questionType: "rating", choices: ["1", "2", "3", "4", "5"] },
  { id: 4, surveyId: 2, questionText: "Which features did you like the most?", questionType: "multiple_choice", choices: ["Ease of use", "Design", "Performance", "Customer support"] },
  { id: 5, surveyId: 2, questionText: "Any additional comments?", questionType: "text" },
]

const initialResponses = [
  { id: 1, stakeholderId: 1, surveyId: 1, questionId: 1, responseText: "4" },
  { id: 2, stakeholderId: 1, surveyId: 1, questionId: 2, responseText: "Improve the response time of customer support." },
  { id: 3, stakeholderId: 2, surveyId: 2, questionId: 3, responseText: "5" },
  { id: 4, stakeholderId: 2, surveyId: 2, questionId: 4, responseText: "Design" },
  { id: 5, stakeholderId: 2, surveyId: 2, questionId: 5, responseText: "No additional comments." },
]

const initialSubmissions = [
  { id: 1, stakeholderId: 1, surveyId: 1, submittedAt: "2024-09-28 10:30:00" },
  { id: 2, stakeholderId: 2, surveyId: 2, submittedAt: "2024-09-28 11:00:00" },
]
const initialSubmissionsBySurveyId = [
  { count: 1, submittedAt: "2024-09-28 10" },
]

const initialStakeholders = [
  { id: 1, stakeholderName: "John", stakeholderType: "Buyer", description: "Regular customer", emailAddress: "john@example.com" },
  { id: 2, stakeholderName: "Doe", stakeholderType: "User", description: "Product user", emailAddress: "doe@example.com" },
  { id: 3, stakeholderName: "Jane", stakeholderType: "User", description: "Product user", emailAddress: "jane@example.com" },
  { id: 4, stakeholderName: "Smith", stakeholderType: "Supplier", description: "Key supplier", emailAddress: "smith@example.com" },
]


export default function EnhancedSurveyManagement() {

  const userEmail = localStorage.getItem('email'); // Replace with actual user email

  const [surveys, setSurveys] = useState(initialSurveys)
  const [questions, setQuestions] = useState(initialQuestions)
  const [responses, setResponses] = useState(initialResponses)
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [submissionsBySurveyId, setSubmissionsBySurveyId] = useState(initialSubmissionsBySurveyId)
  const [stakeholders, setStakeholders] = useState(initialStakeholders)
  const [editingSurvey, setEditingSurvey] = useState(null)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [newSurvey, setNewSurvey] = useState({ title: '', description: '', user_email: userEmail })
  const [newQuestion, setNewQuestion] = useState({ surveyId: 0, questionText: '', questionType: '', choices: [] })
  const [showSurveyDialog, setShowSurveyDialog] = useState(false)
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [stakeholderSearch, setStakeholderSearch] = useState('')
  const [surveySearch, setSurveySearch] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [sharingStakeholderTypes, setSharingStakeholderTypes] = useState([])
  const [notification, setNotification] = useState({ show: false, message: '' })

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stakeholderTypes = [...new Set(stakeholders.map(s => s.stakeholderType))]


  // const [filteredStakeholders, setFilteredStakeholders] = useState<any[]>([]);

  const [showChartDialog, setShowChartDialog] = useState(false)
  const [chartData, setChartData] = useState(null)

  const handleShowChart = async (surveyId) => {
    try {
      // In a real application, you would fetch this data from your API
      const response = await axios.get(`http://localhost:9091/api/allSubmissionsBySurveyId?surveyId=${surveyId}`)
      const data = response.data

      setSubmissionsBySurveyId(response.data)

      // Extract `submitted_at` and `count` values to use in chart
      const labels = data.map(submissionsBySurveyId => submissionsBySurveyId.submitted_at) // Dates
      const counts = data.map(submissionsBySurveyId => submissionsBySurveyId.count) // Counts

      console.log(labels + "sub");
      console.log(counts + "cout");

      setChartData({
        labels: labels,
        datasets: [{
          label: 'Number of Submisions from stakeholders',
          data: counts,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }]
      })
      setShowChartDialog(true)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      showNotification("Error loading chart data. Please try again.")
    }
  }


  interface TransformedSubmission {
    id: number;
    stakeholderId: number;
    surveyId: number;
    stakeholderName: string;
    surveyTitle: string;
    submittedAt: string;
  }

  // Fetch all Submissions when the page loads
  useEffect(() => {
    // Function to fetch submissions from the backend
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get<TransformedSubmission[]>('http://localhost:9091/api/allSubmissions');
        setSubmissions(response.data); // Set the submissions with the fetched data
      } catch (error) {
        console.error('Error fetching submissions:', error);
        showNotification("Error loading submissions. Please try again.");
      }
    };

    fetchSubmissions();
  }, []);


  useEffect(() => {
    // Fetch stakeholders from the API using Axios
    async function fetchStakeholders() {
      try {
        const response = await axios.get("http://localhost:9091/api/getAllStakeholder", {
          params: { user_email: userEmail },
        });

        // Map the response to rename properties
        const renamedStakeholders = response.data.map((stakeholder: any) => ({
          id: stakeholder.id,
          stakeholderName: stakeholder.stakeholder_name, // Renaming here
          stakeholderType: stakeholder.type_name, // Renaming here
          description: stakeholder.description,
          emailAddress: stakeholder.email_address, // Renaming here
        }));
        setStakeholders(renamedStakeholders);
        // setFilteredStakeholders(response.data);

      } catch (error) {
        console.error("Error fetching stakeholders:", error);
        showNotification("Error loading stakeholders. Please try again.");
      }
    }
    fetchStakeholders();
  }, [userEmail]);

  // Define the TransformedResponse type for TypeScript
  interface TransformedResponse {
    id: number;
    stakeholderId: number;
    surveyId: number;
    questionId: number;
    responseText: string;
  }

  // Function to fetch responses (moved outside of useEffect for reuse)
  const fetchResponses = async () => {
    try {
      const response = await axios.get<TransformedResponse[]>('http://localhost:9091/api/allResponses');
      // const response = await axios.get('http://localhost:9091/api/allResponses');
      setResponses(response.data); // Set the responses with the fetched data
    } catch (error) {
      console.error('Error fetching responses:', error);
      showNotification("Error loading responses. Please try again.");
    }
  };

  // Example useEffect where you want to call fetchResponses
  useEffect(() => {
    fetchResponses();  // Fetch responses when the component loads
  }, []);


  // Fetch all surveys when the page loads
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get(`http://localhost:9091/api/allSurveys?user_email=${userEmail}`);
        setSurveys(response.data); // Set the surveys with the fetched data
      } catch (error) {
        console.error('Error fetching surveys:', error);
        showNotification("Error loading surveys. Please try again.");
      }
    };

    fetchSurveys();
  }, []);


  // Function to fetch questions (moved outside of useEffect for reuse)
  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`http://localhost:9091/api/allQuestion?user_email=${userEmail}`);
      setQuestions(response.data); // Set the questions with the fetched data
    } catch (error) {
      console.error('Error fetching questions:', error);
      showNotification("Error loading questions. Please try again.");
    }
  };

  // Fetch questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreateSurvey = async (e: FormEvent) => {
    e.preventDefault();

    // Validation: Ensure both fields are not empty
    if (!newSurvey.title || !newSurvey.description) {
      showNotification("Please fill in all fields.");
      return;
    }

    // setNewSurvey({ title: newSurvey.title, description: newSurvey.description, user_email:userEmail });

    try {
      // Make a POST request to create the survey
      const response = await axios.post('http://localhost:9091/api/newSurvey', newSurvey);

      if (response.data.statusCode == 200) {
        const createdSurvey = { id: Date.now(), ...newSurvey };
        setSurveys([...surveys, createdSurvey]);
        setNewSurvey({ title: '', description: '', user_email: userEmail });
        setShowSurveyDialog(false);
        showNotification("Survey created successfully");
      }
    } catch (error) {
      console.error('Error creating survey:', error);
      showNotification("Error creating survey. Please try again.");
    }
  };


  const handleUpdateSurvey = async () => {
    if (!editingSurvey.title || !editingSurvey.description) {
      showNotification("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.put('http://localhost:9091/api/updateSurvey', editingSurvey);
      if (response.data.statusCode == 204) { // Check the status instead
        setSurveys(surveys.map(s => s.id === editingSurvey.id ? editingSurvey : s));
        setEditingSurvey(null);
        showNotification("Survey updated successfully");
      }
    } catch (error) {
      console.error('Error updating survey:', error);
      showNotification("Error updating survey. Please try again.");
    }
  };

  const handleViewDetails = (survey) => {
    setSelectedSurvey(survey);
    // You can also add any additional logic you want to perform when viewing details
    console.log("Selected Survey:", survey); // Optional: Log the selected survey
  };


  const handleDeleteSurvey = async (id) => {
    try {
      // Call the backend API to delete the survey
      // await axios.delete(`http://localhost:9091/api/deleteSurvey?id=${id}`);
      await axios.put(`http://localhost:9091/api/deleteSurvey?id=${id}`);

      // Update the state to remove the deleted survey and associated data
      setSurveys(surveys.filter(s => s.id !== id));
      setQuestions(questions.filter(q => q.surveyId !== id));
      setResponses(responses.filter(r => r.surveyId !== id));
      setSubmissions(submissions.filter(s => s.surveyId !== id));

      // Show success notification
      showNotification("Survey deleted successfully");
    } catch (error) {
      console.error("Error deleting survey:", error);
      showNotification("Error deleting survey. Please refreash the page.");
    }
  };


  const handleCreateQuestion = async () => {
    if (!newQuestion.surveyId || !newQuestion.questionText || !newQuestion.questionType) {
      showNotification("Please fill in all fields.");
      return;
    }

    let formattedChoices: string[] = [];

    // Process choices for multiple_choice, checkbox, or rating types
    if (newQuestion.questionType === 'multiple_choice' || newQuestion.questionType === 'checkbox') {
      // If it's multiple_choice or checkbox, we use the choices array
      if (!newQuestion.choices.length) {
        showNotification("Please add at least one choice.");
        return;
      }
      formattedChoices = newQuestion.choices;
    } else if (newQuestion.questionType === 'rating') {
      // For rating, choices contain the minimum and maximum rating values
      const minRating = '1';  // Default min rating is 1
      const maxRating = newQuestion.choices[1] || '5';  // Use the value entered, default is 5
      formattedChoices = [minRating, maxRating];
    }

    const question = {
      surveyId: newQuestion.surveyId,
      questionText: newQuestion.questionText,
      questionType: newQuestion.questionType,
      choices: formattedChoices
    };

    try {
      const response = await axios.post('http://localhost:9091/api/addQuestion', question);
      setQuestions([...questions, response.data]);  // Assuming response contains the newly created question
      setNewQuestion({ surveyId: null, questionText: '', questionType: '', choices: [] });
      setShowQuestionDialog(false);
      fetchQuestions();
      showNotification("Question added successfully");
    } catch (error) {
      console.error('Error adding question:', error);
      showNotification("Error adding question. Please try again.");
    }
  };



  const handleUpdateQuestion = async () => {
    // Validate inputs
    if (!editingQuestion.surveyId || !editingQuestion.questionText || !editingQuestion.questionType) {
      showNotification("Please fill in all fields.");
      return;
    }

    let formattedChoices = [];

    // Process choices for multiple_choice, checkbox, or rating types
    if (editingQuestion.questionType === 'multiple_choice' || editingQuestion.questionType === 'checkbox') {
      // Ensure at least one choice is present
      if (!editingQuestion.choices.length) {
        showNotification("Please add at least one choice.");
        return;
      }
      formattedChoices = editingQuestion.choices;
    } else if (editingQuestion.questionType === 'rating') {
      // For rating, choices contain the minimum and maximum rating values
      const minRating = '1';  // Default min rating is 1
      const maxRating = editingQuestion.choices[1] || '5';  // Use the value entered, default is 5
      formattedChoices = [minRating, maxRating];
    }

    const question = {
      id: editingQuestion.id,  // Pass the question ID in the body
      surveyId: editingQuestion.surveyId,
      questionText: editingQuestion.questionText,
      questionType: editingQuestion.questionType,
      choices: formattedChoices
    };

    try {
      // Send the PUT request without binding the ID in the URL
      const response = await axios.put('http://localhost:9091/api/updateQuestion', question);
      setQuestions(questions.map(q => (q.id === editingQuestion.id ? response.data : q))); // Update the question in state

      // After successful update, fetch the updated list of questions
      await fetchQuestions();

      setEditingQuestion(null);
      showNotification("Question updated successfully");
    } catch (error) {
      console.error('Error updating question:', error);
      showNotification("Error updating question. Please try again.");
    }
  };



  const handleDeleteQuestion = async (id) => {
    try {
      // Send PUT request to update the question and its choices' status to 0 (soft delete)
      await axios.put('http://localhost:9091/api/deleteQuestion', { id }); // Send the ID in the request body

      // Update the state to remove the question and its responses
      setQuestions(questions.filter(q => q.id !== id));
      setResponses(responses.filter(r => r.questionId !== id));

      showNotification("Question and its choices deleted successfully.");
    } catch (error) {
      console.error('Error deleting question:', error);
      showNotification("Error deleting question. Please try again.");
    }
  };


  const handleShareSurvey = (survey) => {
    setSelectedSurvey(survey)
    setShowShareDialog(true)
    setSharingStakeholderTypes([])
  }

  const handleSendSurvey = async () => {
    // Filter stakeholders based on selected stakeholder types
    const selectedStakeholders = stakeholders.filter(s => sharingStakeholderTypes.includes(s.stakeholderType));

    // Prepare the payload to send to the backend
    const payload = {
      surveyId: selectedSurvey.id,
      surveyTitle: selectedSurvey.title,
      selectedTypes: sharingStakeholderTypes,
      user_email: userEmail,
    };

    try {
      // Send a POST request to the backend using Axios
      const response = await axios.post('http://localhost:9091/api/share', payload);
      // Handle success response
      console.log(response.data.message);
      showNotification(response.data.message);
    } catch (error) {
      // Handle error response
      console.error("Error sharing survey: ", error);
      showNotification("Error sharing survey.");
    }

    // Reset state after sharing
    setShowShareDialog(false);
    setSelectedSurvey(null);
    setSharingStakeholderTypes([]);
  };


  const showNotification = (message: string) => {
    setNotification({ show: true, message })
    setTimeout(() => setNotification({ show: false, message: '' }), 3000)
  }

  const filteredResponses = responses.filter(response => {
    const stakeholder = stakeholders.find(s => s.id === response.stakeholderId)
    const survey = surveys.find(s => s.id === response.surveyId)
    return (
      stakeholder &&
      survey &&
      stakeholder.stakeholderName.toLowerCase().includes(stakeholderSearch.toLowerCase()) &&
      survey.title.toLowerCase().includes(surveySearch.toLowerCase())
    )
  })

  const filteredSubmissions = submissions.filter(submission => {
    const stakeholder = stakeholders.find(s => s.id === submission.stakeholderId)
    const survey = surveys.find(s => s.id === submission.surveyId)
    return (
      stakeholder &&
      survey &&
      stakeholder.stakeholderName.toLowerCase().includes(stakeholderSearch.toLowerCase()) &&
      survey.title.toLowerCase().includes(surveySearch.toLowerCase())
    )
  })

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Enhanced Survey Management</h1>

        <Tabs defaultValue="surveys" className="space-y-4">
          <TabsList>
            <TabsTrigger value="surveys">Surveys</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          {notification.show && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{notification.message}</span>
            </div>
          )}

          <TabsContent value="surveys">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Surveys</h2>
              <Dialog open={showSurveyDialog} onOpenChange={setShowSurveyDialog}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Create New Survey</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Survey</DialogTitle>
                    <DialogDescription>
                      Create a new survey here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={newSurvey.title}
                        onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newSurvey.description}
                        onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleCreateSurvey}>Save Survey</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surveys.map((survey) => (
                <Card key={survey.id}>
                  <CardHeader>
                    <CardTitle>{survey.title}</CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <Button variant="outline" onClick={() => setEditingSurvey(survey)} className="w-full">
                      <Edit className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button variant="outline" onClick={() => handleViewDetails(survey)} className="w-full">
                      <Eye className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">View Details</span>
                    </Button>
                    <Button variant="outline" onClick={() => handleShareSurvey(survey)} className="w-full">
                      <Share2 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button variant="outline" onClick={() => handleShowChart(survey.id)} className="w-full">
                      <BarChartIcon className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Chart</span>
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteSurvey(survey.id)} className="w-full col-span-2 sm:col-span-1">
                      <Trash className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {editingSurvey && (
              <Dialog open={!!editingSurvey} onOpenChange={() => setEditingSurvey(null)}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Survey</DialogTitle>
                    <DialogDescription>
                      Make changes to your survey here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="edit-title"
                        value={editingSurvey.title}
                        onChange={(e) => setEditingSurvey({ ...editingSurvey, title: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={editingSurvey.description}
                        onChange={(e) => setEditingSurvey({ ...editingSurvey, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" onClick={handleUpdateSurvey}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {selectedSurvey && (
              <Dialog open={!!selectedSurvey} onOpenChange={() => setSelectedSurvey(null)}>
                <DialogContent className="sm:max-w-[725px]">
                  <DialogHeader>
                    <DialogTitle>{selectedSurvey.title}</DialogTitle>
                    <DialogDescription>{selectedSurvey.description}</DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Questions:</h3>
                    <ul className="list-disc pl-5">
                      {questions.filter(q => q.surveyId === selectedSurvey.id).map(question => (
                        <li key={question.id}>{question.questionText}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Submissions:</h3>
                    <ul className="list-disc pl-5">
                      {submissions.filter(s => s.surveyId === selectedSurvey.id).map(submission => (
                        <li key={submission.id}>
                          Stakeholder ID: {submission.stakeholderId}, Submitted at: {submission.submittedAt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Share Survey</DialogTitle>
                  <DialogDescription>
                    Select stakeholder types to share the survey with.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {stakeholderTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`stakeholder-type-${type}`}
                        checked={sharingStakeholderTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSharingStakeholderTypes([...sharingStakeholderTypes, type])
                          } else {
                            setSharingStakeholderTypes(sharingStakeholderTypes.filter(t => t !== type))
                          }
                        }}
                      />
                      <Label htmlFor={`stakeholder-type-${type}`}>{type}</Label>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSendSurvey}>Share Survey</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Survey Results Chart</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {chartData && (
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                          title: {
                            display: true,
                            text: 'Survey Responses',
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="questions">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Questions</h2>
              <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Add New Question</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>
                      Add a new question to a survey. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="survey" className="text-right">
                        Survey
                      </Label>
                      <Select onValueChange={(value) => setNewQuestion({ ...newQuestion, surveyId: parseInt(value) })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a survey" />
                        </SelectTrigger>
                        <SelectContent>
                          {surveys.map((survey) => (
                            <SelectItem key={survey.id} value={survey.id.toString()}>{survey.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="question-text" className="text-right">
                        Question
                      </Label>
                      <Input
                        id="question-text"
                        value={newQuestion.questionText}
                        onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="question-type" className="text-right">
                        Type
                      </Label>
                      <Select onValueChange={(value) => setNewQuestion({ ...newQuestion, questionType: value, choices: [] })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(newQuestion.questionType === 'multiple_choice' || newQuestion.questionType === 'checkbox') && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="choices" className="text-right">
                          Choices
                        </Label>
                        <div className="col-span-3">
                          {newQuestion.choices.map((choice, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <Input
                                value={choice}
                                onChange={(e) => {
                                  const newChoices = [...newQuestion.choices]
                                  newChoices[index] = e.target.value
                                  setNewQuestion({ ...newQuestion, choices: newChoices })
                                }}
                                className="mr-2"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newChoices = newQuestion.choices.filter((_, i) => i !== index)
                                  setNewQuestion({ ...newQuestion, choices: newChoices })
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => setNewQuestion({ ...newQuestion, choices: [...newQuestion.choices, ''] })}
                          >
                            Add Choice
                          </Button>
                        </div>
                      </div>
                    )}
                    {newQuestion.questionType === 'rating' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rating-scale" className="text-right">
                          Rating Scale
                        </Label>
                        <div className="col-span-3 flex items-center">
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={newQuestion.choices[1] || '5'}
                            onChange={(e) => setNewQuestion({ ...newQuestion, choices: ['1', e.target.value] })}
                            className="w-20 mr-2"
                          />
                          <span>points</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleCreateQuestion}>Save Question</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Survey</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Choices</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{surveys.find(s => s.id === question.surveyId)?.title}</TableCell>
                    <TableCell>{question.questionText}</TableCell>
                    <TableCell>{question.questionType}</TableCell>
                    <TableCell>{question.choices ? question.choices.join(', ') : 'N/A'}</TableCell>
                    <TableCell>
                      <Button variant="outline" className="mr-2" onClick={() => setEditingQuestion(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteQuestion(question.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {editingQuestion && (
              <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Question</DialogTitle>
                    <DialogDescription>
                      Make changes to your question here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-question-text" className="text-right">
                        Question
                      </Label>
                      <Input
                        id="edit-question-text"
                        value={editingQuestion.questionText}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-question-type" className="text-right">
                        Type
                      </Label>
                      <Select
                        onValueChange={(value) => setEditingQuestion({ ...editingQuestion, questionType: value, choices: [] })}
                        defaultValue={editingQuestion.questionType}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(editingQuestion.questionType === 'multiple_choice' || editingQuestion.questionType === 'checkbox') && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-choices" className="text-right">
                          Choices
                        </Label>
                        <div className="col-span-3">
                          {editingQuestion.choices.map((choice, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <Input
                                value={choice}
                                onChange={(e) => {
                                  const newChoices = [...editingQuestion.choices]
                                  newChoices[index] = e.target.value
                                  setEditingQuestion({ ...editingQuestion, choices: newChoices })
                                }}
                                className="mr-2"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newChoices = editingQuestion.choices.filter((_, i) => i !== index)
                                  setEditingQuestion({ ...editingQuestion, choices: newChoices })
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => setEditingQuestion({ ...editingQuestion, choices: [...editingQuestion.choices, ''] })}
                          >
                            Add Choice
                          </Button>
                        </div>
                      </div>
                    )}
                    {editingQuestion.questionType === 'rating' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-rating-scale" className="text-right">
                          Rating Scale
                        </Label>
                        <div className="col-span-3 flex items-center">
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={editingQuestion.choices[1] || '5'}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, choices: ['1', e.target.value] })}
                            className="w-20 mr-2"
                          />
                          <span>points</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleUpdateQuestion}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="responses">
            <h2 className="text-2xl font-semibold mb-4">Responses</h2>
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="stakeholder-search">Search by Stakeholder</Label>
                <div className="flex items-center">
                  <Input
                    id="stakeholder-search"
                    value={stakeholderSearch}
                    onChange={(e) => setStakeholderSearch(e.target.value)}
                    placeholder="Enter stakeholder name"
                    className="mr-2"
                  />
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="survey-search">Search by Survey</Label>
                <div className="flex items-center">
                  <Input
                    id="survey-search"
                    value={surveySearch}
                    onChange={(e) => setSurveySearch(e.target.value)}
                    placeholder="Enter survey title"
                    className="mr-2"
                  />
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stakeholder</TableHead>
                  <TableHead>Survey</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>{stakeholders.find(s => s.id === response.stakeholderId)?.stakeholderName}</TableCell>
                    <TableCell>{surveys.find(s => s.id === response.surveyId)?.title}</TableCell>
                    <TableCell>{questions.find(q => q.id === response.questionId)?.questionText}</TableCell>
                    <TableCell>{response.responseText}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="submissions">
            <h2 className="text-2xl font-semibold mb-4">Submissions</h2>
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="stakeholder-search">Search by Stakeholder</Label>
                <div className="flex items-center">
                  <Input
                    id="stakeholder-search"
                    value={stakeholderSearch}
                    onChange={(e) => setStakeholderSearch(e.target.value)}
                    placeholder="Enter stakeholder name"
                    className="mr-2"
                  />
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="survey-search">Search by Survey</Label>
                <div className="flex items-center">
                  <Input
                    id="survey-search"
                    value={surveySearch}
                    onChange={(e) => setSurveySearch(e.target.value)}
                    placeholder="Enter survey title"
                    className="mr-2"
                  />
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stakeholder</TableHead>
                  <TableHead>Survey</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{stakeholders.find(s => s.id === submission.stakeholderId)?.stakeholderName}</TableCell>
                    <TableCell>{surveys.find(s => s.id === submission.surveyId)?.title}</TableCell>
                    <TableCell>{submission.submittedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>


      </div>
    </Layout>

  )
}