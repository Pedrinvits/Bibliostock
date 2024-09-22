"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, Pencil1Icon, Cross2Icon, CheckIcon } from "@radix-ui/react-icons"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { z } from "zod"
import axios from "axios"

const authorSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  yearOfBirth: z.number().min(1000, "Invalid year").max(new Date().getFullYear(), "Year cannot be in the future"),
  sex: z.enum(["M", "F", "O"]),
  nationality: z.string().min(1, "Nationality is required"),
})

const publisherSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  country: z.string().min(1, "Country is required"),
})

const genreSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
})

const bookSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  author: z.number().min(1, "Author is required"),
  genre: z.number().min(1, "Genre is required"),
  publisher: z.number().min(1, "Publisher is required"),
  yearOfPublication: z.number().min(1000, "Invalid year").max(new Date().getFullYear(), "Year cannot be in the future"),
})

type Author = z.infer<typeof authorSchema>
type Publisher = z.infer<typeof publisherSchema>
type Genre = z.infer<typeof genreSchema>
type Book = z.infer<typeof bookSchema>

export default function LibraryInventorySystem() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [newAuthor, setNewAuthor] = useState<Omit<Author, "id">>({ name: "", yearOfBirth: 0, sex: "Male", nationality: "" })
  const [newPublisher, setNewPublisher] = useState({ name: "", country : ""})
  const [newGenre, setNewGenre] = useState("")
  const [newBook, setNewBook] = useState<Omit<Book, "id">>({ title: "", author: "", genre: "", publisher: "", yearOfPublication: 0 })
  const [editingAuthorId, setEditingAuthorId] = useState<number | null>(null)
  const [editingPublisherId, setEditingPublisherId] = useState<number | null>(null)
  const [editingGenreId, setEditingGenreId] = useState<number | null>(null)
  const [editingBookId, setEditingBookId] = useState<number | null>(null)
  const [editedAuthor, setEditedAuthor] = useState<Author | null>(null)
  const [editedPublisher, setEditedPublisher] = useState<Publisher | null>(null)
  const [editedGenre, setEditedGenre] = useState<Genre | null>(null)
  const [editedBook, setEditedBook] = useState<Book | null>(null)
  const { toast } = useToast()
 
  const handleAddAuthor = async ()  => {
    try {
      const validatedAuthor = authorSchema.parse({ ...newAuthor, id: Date.now() })
      
      const authorData = {
        name: validatedAuthor.name,
        birth_year: validatedAuthor.yearOfBirth,  
        gender: validatedAuthor.sex,              
        nationality: validatedAuthor.nationality,
      };
      const res = await axios.post('http://localhost:8000/api/authors', authorData);
      if(res.status == 201){
        setAuthors([...authors, res.data.author])
        setNewAuthor({ name: "", yearOfBirth: 0, sex: "Male", nationality: "" })
        toast({ title: "Success", description: res.data.message })
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Erro ao criar autor", description: error.errors[0].message, variant: "destructive" })
      }
    }
  }

  const handleEditAuthor = (id: number, field: keyof Author, value: string | number) => {
    if (editedAuthor && editedAuthor.id === id) {
      setEditedAuthor((prev) => ({ ...prev, [field]: value }));
    } else {
      // Se não há autor editado, encontre o autor e inicie a edição
      const author = authors.find(a => a.id === id);
      if (author) {
        setEditedAuthor({ ...author, [field]: value });
      }
    }
  };

  const handleConfirmEditAuthor = async () => {
    if (editedAuthor) {
      try {
        const authorData = {
          name: editedAuthor.name,
          birth_year: editedAuthor.birth_year,
          gender: editedAuthor.gender,
          nationality: editedAuthor.nationality,
        };
        console.log(authorData);
        
        const res = await axios.put(`http://localhost:8000/api/authors/${editedAuthor.id}`, authorData);
        if (res.status === 200) {
          setAuthors(authors.map(author => author.id === editedAuthor.id ? editedAuthor : author));
          setEditingAuthorId(null);
          setEditedAuthor(null);
          toast({ title: "Success", description: "Author updated successfully" });
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({ title: "Error", description: error.errors[0].message, variant: "destructive" });
        }
      }
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    const res = await axios.delete(`http://localhost:8000/api/authors/${id}`);
    if(res.status == 200){
      setAuthors(authors.filter(author => author.id !== id))
      toast({ title: "Success", description: "Author deleted successfully" })
    }
  }

  const handleAddItem = async (type: "publishers" | "genres") => {
    try {
      const newItem = type === "publishers" ? newPublisher : newGenre
      const schema = type === "publishers" ? publisherSchema : genreSchema
      
      if (type === "publishers") {
        const validatedItem = schema.parse({ id: Date.now(), name: newItem.name, country: newItem.country })
        const publisherData = {
          name: validatedItem.name,   
          country: validatedItem.country,
        };

        const res = await axios.post('http://localhost:8000/api/publishers', publisherData);
        if(res.status == 201) {
          setPublishers([...publishers, publisherData]);
           setNewPublisher("");
        }
      } else {

        const validatedItem = schema.parse({ id: Date.now(), name: newItem})

        const genreData = {
          name: validatedItem.name,   
        };

        const res = await axios.post('http://localhost:8000/api/genres', genreData);

        if(res.status == 201) {
          setGenres([...genres, validatedItem])
          setNewGenre("")
        }
      }
      toast({ title: "Success", description: `${type === "publishers" ? "Publisher" : "Genre"} added successfully` })
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Error", description: error.errors[0].message, variant: "destructive" })
      }
    }
  }

  const handleEditItem = (type: "publishers" | "genres", id: number, newName: string) => {
    if (type === "publishers") {
      const publisher = publishers.find(p => p.id === id)
      if (publisher) {
        setEditedPublisher({ ...publisher, name: newName })
      }
    } else {
      const genre = genres.find(g => g.id === id);
      if (genre && field === "name") {
        setEditedGenre({ ...genre, name: newValue });
      }
    }
  };
  

  const handleConfirmEditItem = async (type: "publishers" | "genres") => {
    try {
      if (type === "publishers") {
        // const validatedPublisher = publisherSchema.parse(editedPublisher)
    
        const res = await axios.put(`http://localhost:8000/api/publishers/${editedPublisher.id}`,{name : editedPublisher.name, country : editedPublisher.country});

        setPublishers(publishers.map(publisher => publisher.id === editedPublisher.id ? editedPublisher : publisher))

        setEditingPublisherId(null)
        setEditedPublisher(null)
      } else if (type === "genres" && editedGenre) {
        const validatedGenre = genreSchema.parse(editedGenre)
        const res = await axios.put(`http://localhost:8000/api/genres/${validatedGenre.id}`,{name : validatedGenre.name});
        setGenres(genres.map(genre => genre.id === validatedGenre.id ? validatedGenre : genre))
        setEditingGenreId(null)
        setEditedGenre(null)
      }
      toast({ title: "Success", description: `${type === "publishers" ? "Publisher" : "Genre"} updated successfully` })
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Error", description: error.errors[0].message, variant: "destructive" })
      }
    }
  }

  const handleDeleteItem = async (type: "publishers" | "genres", id: number) => {

    if (type === "publishers") {
      const res = await axios.delete(`http://localhost:8000/api/publishers/${id}`);
      if(res.status == 200){
        setPublishers(publishers.filter(publisher => publisher.id !== id))
        toast({ title: "Success", description: "Publisher deleted successfully" })
      }
      
    } else {
      const res = await axios.delete(`http://localhost:8000/api/genres/${id}`);
      if(res.status == 200){
        setGenres(genres.filter(genre => genre.id !== id))
        toast({ title: "Success", description: "Genre deleted successfully" })
      }
     
    }
    toast({ title: "Success", description: `${type === "publishers" ? "Publisher" : "Genre"} deleted successfully` })
  }

  const handleAddBook = async () => {
    try {

      const validatedBook = bookSchema.parse({ ...newBook, id: Date.now() })
      const BookData = {
        "author_id": validatedBook.author,
        "genre_id": validatedBook.genre,
        "publisher_id": validatedBook.publisher,
        "title": validatedBook.title,
        "release_year": validatedBook.yearOfPublication
      };
      const res = await axios.post('http://localhost:8000/api/books', BookData);

      setBooks([...books, validatedBook])
      setNewBook({ title: "", author, genre, publisher: "", yearOfPublication: 0 })
      toast({ title: "Success", description: "Book added successfully" })
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Error", description: error.errors[0].message, variant: "destructive" })
      }
    }
  }

  const handleEditBook = (id: number, field: keyof Book, value: string | number) => {
    if (editedBook && editedBook.id === id) {
      setEditedBook((prev) => ({ ...prev, [field]: value }));
    } else {
      const book = books.find(b => b.id === id);
      if (book) {
        setEditedBook({ ...book, [field]: value });
      }
    }
  }

  const handleConfirmEditBook = async () => {
    if (editedBook) {
      try {
        const editBookData = {
          author_id: editedBook.author_id,
          genre_id: editedBook.genre_id,
          publisher_id: editedBook.publisher_id,
          title: editedBook.title,
          release_year: editedBook.yearOfPublication, // Verifique se o campo está correto
        };
        console.log(editBookData); // Verifique os dados a serem enviados
  
        // const validatedBook = bookSchema.parse(editBookData); // Valide os dados se necessário
  
        const res = await axios.put(`http://localhost:8000/api/books/${editedBook.id}`, editBookData);
  
        if (res.status === 200) { // Verifique a resposta da API
          // Atualize o estado de livros com os dados editados
          setBooks(books.map(book => (book.id === editedBook.id ? { ...book, ...editBookData } : book)));
          setEditingBookId(null);
          setEditedBook(null);
          toast({ title: "Success", description: "Book updated successfully" });
        }
      } catch (error) {
        console.error("Error updating book", error);
        if (error instanceof z.ZodError) {
          toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
        } else {
          toast({ title: "Error", description: "Failed to update book", variant: "destructive" });
        }
      }
    }
  };
  

  const handleDeleteBook = (id: number) => {
    setBooks(books.filter(book => book.id !== id))
    toast({ title: "Success", description: "Book deleted successfully" })
  }

  const renderItemList = (items: Publisher[] | Genre[], type: "publishers" | "genres") => (
    
    <Table>
    <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      {type === "publishers" && <TableHead>Country</TableHead>} 
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
    <TableBody>
    {Array.isArray(items) && items.map((item) => (
        <TableRow key={item.id}>
          <TableCell>
            {(type === "publishers" ? editingPublisherId : editingGenreId) === item.id ? (
              <Input
                value={(type === "publishers" ? editedPublisher : editedGenre)?.name || item.name}
                onChange={(e) => handleEditItem(type, item.id, e.target.value, "name")}
                autoFocus
              />
            ) : (
              item.name
            )}
          </TableCell>

          {type === "publishers" && (
            <TableCell>
              {editingPublisherId === item.id ? (
                <Input
                  value={editedPublisher?.country || item.country}
                  onChange={(e) => handleEditItem(type, item.id, e.target.value, "country")}
                />
              ) : (
                item.country
              )}
            </TableCell>
          )}


        <TableCell>
          {(type === "publishers" ? editingPublisherId : editingGenreId) === item.id ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => handleConfirmEditItem(type)}>
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => type === "publishers" ? setEditingPublisherId(null) : setEditingGenreId(null)}>
                <Cross2Icon className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => type === "publishers" ? setEditingPublisherId(item.id) : setEditingGenreId(item.id)}>
                <Pencil1Icon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(type, item.id)}>
                <Cross2Icon className="h-4 w-4" />
              </Button>
            </>
          )}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
  </Table>

  )
  useEffect(() => {
    
    const fetchAuthors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/authors');
        // console.log(response);
        
        setAuthors(response.data.authors);
      } catch (error) {
        console.error("Failed to fetch authors", error);
      }
    };

    const fetchBooks= async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/books');
        setBooks(response.data.books);
      } catch (error) {
        console.error("Failed to fetch books", error);
      }
    };

    const fetchGenres = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/genres');
        setGenres(response.data.genre);
      } catch (error) {
        console.error("Failed to fetch genres", error);
      }
    };

    const fetchPublishers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/publishers');
        console.log(response);
        
        setPublishers(response.data.publishers);
      } catch (error) {
        console.error("Failed to fetch publishers", error);
      }
    };
    fetchBooks();
    fetchGenres();
    fetchPublishers();
    fetchAuthors();
  }, []);

  const createMap = (array, keyField, valueField) => {
    const validArray = Array.isArray(array) ? array : Object.values(array);
    return validArray.reduce((map, item) => {
      map[item[keyField]] = item[valueField];
      return map;
    }, {});
  };
  
  
  const authorMap = createMap(authors, 'id', 'name');
  const genreMap = createMap(genres, 'id', 'name');
  const publisherMap = createMap(publishers, 'id', 'name');
  
    
  return (
    <div className="container mx-auto p-4 bg-card shadow-2xl rounded-lg m-2 w-[90%] sm:w-[90%]">
      <h1 className="text-2xl font-bold mb-4">Library Inventory System</h1>
      <Tabs defaultValue="authors">
        <TabsList>
          <TabsTrigger value="authors">Authors</TabsTrigger>
          <TabsTrigger value="publishers">Publishers</TabsTrigger>
          <TabsTrigger value="genres">Literary Genres</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
        </TabsList>
        <TabsContent value="authors">
          <h2 className="text-xl font-semibold mb-2">Authors</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Year of Birth</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authors.map(author => (
                <TableRow key={author.id}>
                  <TableCell>
                    {editingAuthorId === author.id ? (
                      <Input
                        value={editedAuthor?.name ?? author.name}
                        onChange={(e) => handleEditAuthor(author.id, "name", e.target.value)}
                        autoFocus
                      />
                    ) : (
                      author.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingAuthorId === author.id ? (
                      <Input
                        type="string"
                        value={editedAuthor?.birth_year ?? author.birth_year}
                        onChange={(e) => handleEditAuthor(author.id, "birth_year", parseInt(e.target.value))}
                      />
                    ) : (
                      author.birth_year
                    )}
                  </TableCell>
                  <TableCell>
                    {editingAuthorId === author.id ? (
                      <Select
                        value={editedAuthor?.gender ?? author.gender}
                        onValueChange={(value) => handleEditAuthor(author.id, "gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                          <SelectItem value="O">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      author.gender
                    )}
                  </TableCell>
                  <TableCell>
                    {editingAuthorId === author.id ? (
                      <Input
                        value={editedAuthor?.nationality ?? author.nationality}
                        onChange={(e) => handleEditAuthor(author.id, "nationality", e.target.value)}
                      />
                    ) : (
                      author.nationality
                    )}
                  </TableCell>
                  <TableCell>
                    {editingAuthorId === author.id ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={handleConfirmEditAuthor}>
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingAuthorId(null)}>
                          <Cross2Icon className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => setEditingAuthorId(author.id)}>
                          <Pencil1Icon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAuthor(author.id)}>
                          <Cross2Icon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-4">
            <Input
              placeholder="Name"
              value={newAuthor.name}
              onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Year of Birth"
              value={newAuthor.yearOfBirth || ""}
              onChange={(e) => setNewAuthor({ ...newAuthor, yearOfBirth: parseInt(e.target.value) })}
            />
            <Select
              value={newAuthor.sex}
              onValueChange={(value) => setNewAuthor({ ...newAuthor, sex: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
                <SelectItem value="O">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Nationality"
              value={newAuthor.nationality}
              onChange={(e) => setNewAuthor({ ...newAuthor, nationality: e.target.value })}
            />
          </div>
          <Button onClick={handleAddAuthor} className="mt-2 sm:w-fit w-full">
            <PlusIcon className="mr-2 h-4 w-4" /> Add Author
          </Button>
        </TabsContent>
        <TabsContent value="publishers">
          <h2 className="text-xl font-semibold mb-2">Publishers</h2>
          {renderItemList(publishers, "publishers")}
          <div className="flex mt-4 sm:flex-row flex-col gap-4">
            <Input
              placeholder="New publisher name"
              value={newPublisher.name}
              onChange={(e) => setNewPublisher({ ...newPublisher, name: e.target.value })}
              className="mr-2"
            />
            <Input
              placeholder="New publisher country"
              value={newPublisher.country}
              onChange={(e) => setNewPublisher({ ...newPublisher, country: e.target.value })}
              className="mr-2"
            />
            <Button onClick={() => handleAddItem("publishers")}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Publisher
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="genres">
          <h2 className="text-xl font-semibold mb-2">Literary Genres</h2>
          {renderItemList(genres, "genres")}
          <div className="flex mt-4 sm:flex-row flex-col gap-4">
            <Input
              placeholder="New genre name"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              className="mr-2"
            />
            <Button onClick={() => handleAddItem("genres")}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Genre
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="books">
          <h2 className="text-xl font-semibold mb-2">Books</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead>Year of Publication</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map(book => (
                <TableRow key={book.id}>
                  <TableCell>
                    {editingBookId === book.id ? (
                      <Input
                        value={editedBook?.title || book.title}
                        onChange={(e) => handleEditBook(book.id, "title", e.target.value)}
                        autoFocus
                      />
                    ) : (
                      book.title
                    )}
                  </TableCell>
                  <TableCell>
                    {editingBookId === book.id ? (
                      <Select
                        value={editedBook?.author || book.author_id}
                        onValueChange={(value) => handleEditBook(book.id, "author", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                          {authors.map(author => (
                            <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      authorMap[book.author_id] || "Unknown Author"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingBookId === book.id ? (
                      <Select
                        value={editedBook?.genre || book.genre_id} // Use genre_id aqui
                        onValueChange={(value) => handleEditBook(book.id, "genre", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map(genre => (
                            <SelectItem key={genre.id} value={genre.id}>{genre.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      genreMap[book.genre_id] || "Unknown Genre" // Use o genreMap aqui
                    )}
                  </TableCell>
                  <TableCell>
                    {editingBookId === book.id ? (
                      <Select
                        value={editedBook?.publisher || book.publisher_id} // Use publisher_id aqui
                        onValueChange={(value) => handleEditBook(book.id, "publisher", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select publisher" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(publishers) && publishers.map(publisher => (
                            <SelectItem key={publisher.id} value={publisher.id}>{publisher.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      publisherMap[book.publisher_id] || "Unknown Publisher" // Use o publisherMap aqui
                    )}
                  </TableCell>
                  <TableCell>
                    {editingBookId === book.id ? (
                      <Input
                        type="number"
                        value={editedBook?.yearOfPublication || book.release_year}
                        onChange={(e) => handleEditBook(book.id, "yearOfPublication", parseInt(e.target.value))}
                      />
                    ) : (
                      book.release_year
                    )}
                  </TableCell>
                  <TableCell>
                    {editingBookId === book.id ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={handleConfirmEditBook}>
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingBookId(null)}>
                          <Cross2Icon className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => setEditingBookId(book.id)}>
                          <Pencil1Icon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBook(book.id)}>
                          <Cross2Icon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>


          </Table>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-4">
            <Input
              placeholder="Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
            <Select
              value={newBook.author}
              onValueChange={(value) => setNewBook({ ...newBook, author: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent>
                {authors.map(author => (
                  <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newBook.genre}
              onValueChange={(value) => setNewBook({ ...newBook, genre: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map(genre => (
                  <SelectItem key={genre.id} value={genre.id}>{genre.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newBook.publisher}
              onValueChange={(value) => setNewBook({ ...newBook, publisher: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select publisher" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(publishers) && publishers.map(publisher => (
                  <SelectItem key={publisher.id} value={publisher.id}>{publisher.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Year of Publication"
              value={newBook.yearOfPublication || ""}
              onChange={(e) => setNewBook({ ...newBook, yearOfPublication: parseInt(e.target.value) })}
            />
          </div>
          <Button onClick={handleAddBook} className="mt-2 sm:w-fit w-full">
            <PlusIcon className="mr-2 h-4 w-4" /> Add Book
          </Button>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}