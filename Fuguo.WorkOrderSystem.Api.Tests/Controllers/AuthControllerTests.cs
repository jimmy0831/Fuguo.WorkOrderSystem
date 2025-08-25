using Xunit;
using Moq;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using Fuguo.WorkOrderSystem.Api.Controllers;
using Fuguo.WorkOrderSystem.Api.Data;
using Fuguo.WorkOrderSystem.Api.Models;
using Fuguo.WorkOrderSystem.Api.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Fuguo.WorkOrderSystem.Api.Tests.Controllers
{
    public class AuthControllerTests
    {
        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOkResult()
        {
            // Arrange
            var mockDbContext = new Mock<ApplicationDbContext>();
            var mockConfiguration = new Mock<IConfiguration>();
            var mockUserSet = new Mock<DbSet<User>>();

            var users = new List<User>
        {
            new User { Account = "testuser", Password = BCrypt.Net.BCrypt.HashPassword("password") }
        }.AsQueryable();

            mockUserSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(users.Provider);
            mockUserSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(users.Expression);
            mockUserSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(users.ElementType);
            mockUserSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(users.GetEnumerator());

            mockDbContext.Setup(c => c.Users).Returns(mockUserSet.Object);

            var authController = new AuthController(mockDbContext.Object, mockConfiguration.Object);
            var loginRequest = new LoginRequestDto { Account = "testuser", Password = "password" };

            // Act
            var result = await authController.Login(loginRequest);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }
    }
}
