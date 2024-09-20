"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, Pencil1Icon, Cross2Icon, CheckIcon } from "@radix-ui/react-icons"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { z } from "zod"

const authorSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  yearOfBirth: z.number().min(1000, "Invalid year").max(new Date().getFullYear(), "Year cannot be in the future"),
  sex: z.enum(["Male", "Female", "Other"]),
  nationality: z.string().min(1, "Nationality is required"),
})

const publisherSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
})

const genreSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
})

const bookSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string().min(1, "Genre is required"),
  publisher: z.string().min(1, "Publisher is required"),
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
  const [newPublisher, setNewPublisher] = useState("")
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

  const handleAddAuthor = () => {
    try {
      const validatedAuthor = authorSchema.parse({ ...newAuthor, id: Date.now() })
      setAuthors([...authors, validatedAuthor])
      setNewAuthor({ name: "", yearOfBirth: 0, sex: "Male", nationality: "" })
      toast({ title: "Success", description: "Author added successfully" })
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Error", description: error.errors[0].message, variant: "destructive" })
      }
    }
  }

  const handleEditAuthor = (id: number, field: keyof Author, value: string | number) => {
    const author = authors.find(a => a.id === id)
    if (author) {
      setEditedAuthor({ ...author, [field]: value })
    }
  }

  const handleConfirmEditAuthor = () => {
    if (editedAuthor) {
      try {
        const validatedAuthor = authorSchema.parse(editedAuthor)
        setAuthors(authors.map(author => author.id === validatedAuthor.id ? validatedAuthor : author))
        setEditingAuthorId(null)
        setEditedAuthor(null)
        toast({ title: "Success", description: "Author updated successfully" })
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({ title: "Error", description: error.errors[0].message, variant: "destructive" })
        }
      }
    }
  }

  const handleDeleteAuthor = (id: number) => {
    setAuthors(authors.filter(author => author.id !== id))
    toast({ title: "Success", description: "Author deleted successfully" })
  }

  const handleAddItem = (type: "publishers" | "genres") => {
    try {
      const newItem = type === "publishers" ? newPublisher : newGenre
      const schema = type === "publishers" ? publisherSchema : genreSchema
      const validatedItem = schema.parse({ id: Date.now(), name: newItem })
      if (type === "publishers") {
        setPublishers([...publishers, validatedItem])
        setNewPublisher("")
      } else {
        setGenres([...genres, validatedItem])
        setNewGenre("")
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
      const genre = genres.find(g => g.id === id)
      if (genre) {
        setEditedGenre({ ...genre, name: newName })
      }
    }
  }

  const handleConfirmEditItem = (type: "publishers" | "genres") => {
    try {
      if (type === "publishers" && editedPublisher) {
        const validatedPublisher = publisherSchema.parse(editedPublisher)
        setPublishers(publishers.map(publisher => publisher.id === validatedPublisher.id ? validatedPublisher : publisher))
        setEditingPublisherId(null)
        setEditedPublisher(null)
      } else if (type === "genres" && editedGenre) {
        const validatedGenre = genreSchema.parse(editedGenre)
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

  const handleDeleteItem = (type: "publishers" | "genres", id: number) => {
    if (type === "publishers") {
      setPublishers(publishers.filter(publisher => publisher.id !== id))
    } else {
      setGenres(genres.filter(genre => genre.id !== id))
    }
    toast({ title: "Success", description: `${type === "publishers" ? "Publisher" : "Genre"} deleted successfully` })
  }

  const handleAddBook = () => {
    try {
      const validatedBook = bookSchema.parse({ ...newBook, id: Date.now() })
      setBooks([...books, validatedBook])
      setNewBook({ title: "", author: "", genre: "", publisher: "", yearOfPublication: 0 })
      toast({ title: "Success", description: "Book added successfully" })
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Error", description: error.errors[0].message, variant: "destructive" })
      }
    }
  }

  const handleEditBook = (id: number, field: keyof Book, value: string | number) => {
    const book = books.find(b => b.id === id)
    if (book) {
      setEditedBook({ ...book, [field]: value })
    }
  }

  const handleConfirmEditBook = () => {
    if (editedBook) {
      try {
        const validatedBook = bookSchema.parse(editedBook)
        setBooks(books.map(book => book.id === validatedBook.id ? validatedBook : book))
        setEditingBookId(null)
        setEditedBook(null)
        toast({ title: "Success", description: "Book updated successfully" })
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({ title: "Error", description: error.errors[0].message, variant: "destructive" })
        }
      }
    }
  }

  const handleDeleteBook = (id: number) => {
    setBooks(books.filter(book => book.id !== id))
    toast({ title: "Success", description: "Book deleted successfully" })
  }

  const renderItemList = (items: Publisher[] | Genre[], type: "publishers" | "genres") => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell>
              {(type === "publishers" ? editingPublisherId : editingGenreId) === item.id ? (
                <Input
                  value={(type === "publishers" ? editedPublisher : editedGenre)?.name || item.name}
                  onChange={(e) => handleEditItem(type, item.id, e.target.value)}
                  autoFocus
                />
              ) : (
                item.name
              )}
            </TableCell>
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

  return (
    <div className="container mx-auto p-4">
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
                        value={editedAuthor?.name || author.name}
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
                        type="number"
                        value={editedAuthor?.yearOfBirth || author.yearOfBirth}
                        onChange={(e) => handleEditAuthor(author.id, "yearOfBirth", parseInt(e.target.value))}
                      />
                    ) : (
                      author.yearOfBirth
                    )}
                  </TableCell>
                  <TableCell>
                    {editingAuthorId === author.id ? (
                      <Select
                        value={editedAuthor?.sex || author.sex}
                        onValueChange={(value) => handleEditAuthor(author.id, "sex", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      author.sex
                    )}
                  </TableCell>
                  <TableCell>
                    {editingAuthorId === author.id ? (
                      <Input
                        value={editedAuthor?.nationality || author.nationality}
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
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
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
              value={newPublisher}
              onChange={(e) => setNewPublisher(e.target.value)}
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
                        value={editedBook?.author || book.author}
                        onValueChange={(value) => handleEditBook(book.id, "author", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                          {authors.map(author => (
                            <SelectItem key={author.id} value={author.name}>{author.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      book.author
                    )}
                  </TableCell>
                  <TableCell>
                    {editingBookId === book.id ? (
                      <Select
                        value={editedBook?.genre || book.genre}
                        onValueChange={(value) => handleEditBook(book.id, "genre", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map(genre => (
                            <SelectItem key={genre.id} value={genre.name}>{genre.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      book.genre
                    )}
                  </TableCell>
                  <TableCell>
                    {editingBookId === book.id ? (
                      <Select
                        value={editedBook?.publisher || book.publisher}
                        onValueChange={(value) => handleEditBook(book.id, "publisher", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select publisher" />
                        </SelectTrigger>
                        <SelectContent>
                          {publishers.map(publisher => (
                            <SelectItem key={publisher.id} value={publisher.name}>{publisher.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      book.publisher
                    )}
                  </TableCell>
                  <TableCell>
                    {editingBookId === book.id ? (
                      <Input
                        type="number"
                        value={editedBook?.yearOfPublication || book.yearOfPublication}
                        onChange={(e) => handleEditBook(book.id, "yearOfPublication", parseInt(e.target.value))}
                      />
                    ) : (
                      book.yearOfPublication
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
                  <SelectItem key={author.id} value={author.name}>{author.name}</SelectItem>
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
                  <SelectItem key={genre.id} value={genre.name}>{genre.name}</SelectItem>
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
                {publishers.map(publisher => (
                  <SelectItem key={publisher.id} value={publisher.name}>{publisher.name}</SelectItem>
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