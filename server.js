const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql');

const app = express();

const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
];

const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }
];

const BookType = new GraphQLObjectType({
    name: 'book',
    description: 'this represents a book written by an author',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: ({ authorId }) => {
                return authors.find(author => author.id == authorId);
            }
        },
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'author',
    description: 'this represents an author',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        books: {
            type: GraphQLList(BookType),
            resolve: ({ id }) => {
                return books.filter(book => book.authorId == id);
            }
        },
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'root query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'a book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, { id }) => books.find(book => book.id == id),
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'list of books',
            resolve: () => books,
        },
        author: {
            type: AuthorType,
            description: 'an author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, { id }) => authors.find(author => author.id == id),
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'list of authors',
            resolve: () => authors,
        },

    })
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'root mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, { name, authorId }) => {
                const book = { id: books.length + 1, name, authorId };
                books.push(book);
                return book;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, { name }) => {
                const author = { id: authors.length + 1, name };
                authors.push(author);
                return author;
            }
        },
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

app.listen(5000, () => console.log('server is running'));