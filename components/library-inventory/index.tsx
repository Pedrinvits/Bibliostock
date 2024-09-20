"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, Pencil1Icon, Cross2Icon } from "@radix-ui/react-icons"

type Author = {
  id: number
  name: string
  yearOfBirth: number
  sex: string
  nationality: string
}

type Publisher = {
  id: number
  name: string
}

type Genre = {
  id: number
  name: string
}

type Book = {
  id: number
  title: string
  author: string
  genre: string
  publisher: string
  yearOfPublication: number
}

export default function LibraryInventorySystem() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [newAuthor, setNewAuthor] = useState<Omit<Author, "id">>({ name: "", yearOfBirth: 0, sex: "", nationality: "" })
  const [newPublisher, setNewPublisher] = useState("")
  const [newGenre, setNewGenre] = useState("")
  const [newBook, setNewBook] = useState<Omit<Book, "id">>({ title: "", author: "", genre: "", publisher: "", yearOfPublication: 0 })
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleAddAuthor = () => {
    if (newAuthor.name.trim() === "") return
    setAuthors([...authors, { ...newAuthor, id: Date.now() }])
    setNewAuthor({ name: "", yearOfBirth: 0, sex: "", nationality: "" })
  }

  const handleEditAuthor = (id: number, field: keyof Author, value: string | number) => {
    setAuthors(authors.map(author => author.id === id ? { ...author, [field]: value } : author))
  }

  const handleDeleteAuthor = (id: number) => {
    setAuthors(authors.filter(author => author.id !== id))
  }

  const handleAddItem = (type: "publishers" | "genres") => {
    const newItem = type === "publishers" ? newPublisher : newGenre
    if (newItem.trim() === "") return
    const newItemObj = { id: Date.now(), name: newItem }
    if (type === "publishers") {
      setPublishers([...publishers, newItemObj])
      setNewPublisher("")
    } else {
      setGenres([...genres, newItemObj])
      setNewGenre("")
    }
  }

  const handleEditItem = (type: "publishers" | "genres", id: number, newName: string) => {
    if (type === "publishers") {
      setPublishers(publishers.map(publisher => publisher.id === id ? { ...publisher, name: newName } : publisher))
    } else {
      setGenres(genres.map(genre => genre.id === id ? { ...genre, name: newName } : genre))
    }
    setEditingId(null)
  }

  const handleDeleteItem = (type: "publishers" | "genres", id: number) => {
    if (type === "publishers") {
      setPublishers(publishers.filter(publisher => publisher.id !== id))
    } else {
      setGenres(genres.filter(genre => genre.id !== id))
    }
  }

  const handleAddBook = () => {
    if (newBook.title.trim() === "" || newBook.author.trim() === "" || newBook.publisher.trim() === "" || newBook.genre.trim() === "") return
    setBooks([...books, { ...newBook, id: Date.now() }])
    setNewBook({ title: "", author: "", genre: "", publisher: "", yearOfPublication: 0 })
  }

  const handleEditBook = (id: number, field: keyof Book, value: string | number) => {
    setBooks(books.map(book => book.id === id ? { ...book, [field]: value } : book))
  }

  const handleDeleteBook = (id: number) => {
    setBooks(books.filter(book => book.id !== id))
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
              {editingId === item.id ? (
                <Input
                  value={item.name}
                  onChange={(e) => handleEditItem(type, item.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  autoFocus
                />
              ) : (
                item.name
              )}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" onClick={() => setEditingId(item.id)}>
                <Pencil1Icon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(type, item.id)}>
                <Cross2Icon className="h-4 w-4" />
              </Button>
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
                    {editingId === author.id ? (
                      <Input
                        value={author.name}
                        onChange={(e) => handleEditAuthor(author.id, "name", e.target.value)}
                        onBlur={() => setEditingId(null)}
                        autoFocus
                      />
                    ) : (
                      author.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === author.id ? (
                      <Input
                        type="number"
                        value={author.yearOfBirth}
                        onChange={(e) => handleEditAuthor(author.id, "yearOfBirth", parseInt(e.target.value))}
                        onBlur={() => setEditingId(null)}
                      />
                    ) : (
                      author.yearOfBirth
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === author.id ? (
                      <Select
                        value={author.sex}
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
                    {editingId === author.id ? (
                      <Input
                        value={author.nationality}
                        onChange={(e) => handleEditAuthor(author.id, "nationality", e.target.value)}
                        onBlur={() => setEditingId(null)}
                      />
                    ) : (
                      author.nationality
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(author.id)}>
                      <Pencil1Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAuthor(author.id)}>
                      <Cross2Icon className="h-4 w-4" />
                    </Button>
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
                    {editingId === book.id ? (
                      <Input
                        value={book.title}
                        onChange={(e) => handleEditBook(book.id, "title", e.target.value)}
                        onBlur={() => setEditingId(null)}
                        autoFocus
                      />
                    ) : (
                      book.title
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === book.id ? (
                      <Select
                        value={book.author}
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
                    {editingId === book.id ? (
                      <Select
                        value={book.genre}
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
                    {editingId === book.id ? (
                      <Select
                        value={book.publisher}
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
                    {editingId === book.id ? (
                      <Input
                        type="number"
                        value={book.yearOfPublication}
                        onChange={(e) => handleEditBook(book.id, "yearOfPublication", parseInt(e.target.value))}
                        onBlur={() => setEditingId(null)}
                      />
                    ) : (
                      book.yearOfPublication
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(book.id)}>
                      <Pencil1Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBook(book.id)}>
                      <Cross2Icon className="h-4 w-4" />
                    </Button>
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
    </div>
  )
}